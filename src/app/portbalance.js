/*
Gestion d'une balance Gram XFOC S2
Pour lui demander le poids courant envoyer: STX(2) $ ETX(3)
On reçoit (pour 176g) : STX(2) !  space space space 0 . 1 7 6 CR(13) ETX(3)
Si poids 0, on a ) au lieu de !

Une instance de classe Balance par balance (bien qu'on n'en ait qu'une).
La réception des changements de poids ne s'obtient pas en une seule lecture, d'où un protocole un peu complexe.
Le principe est de pooler la balance en lui demandant son poids courant toutes les 0,5s (delaiDemandePoids)
Il se peut que la balance soit off ou ait été éteinte :
quand on lui demande son pods courant si au bout de 1s (delaiDetectionOff) elle n'a pas répondu
elle est considérée comme ayant été éteinte.
Pour la connexion (en fait se mettre à l'écoute) en cas d'échec on essaie 3s (delaiRelanceEcoute) plus tard.
*/

import { remote } from 'electron'

/*
Le require de serialport DOIT être fait dans le process principal en electron
Malgré cela en test ça ne marche bien que la première fois. Quasar dev relance des connexions et
ça perturbe grave la balance. Il faut relancer l'appli.
*/

const { SerialPort } = remote.require('serialport')
const { DelimiterParser } = remote.require('@serialport/parser-delimiter')

const delaiDemandePoids = 500 // en ms.
const delaiDetectionOff = 1000 //
const delaiRelanceEcoute = 3000
const options = { lock: false, baudRate: 9600, autoOpen: false }
const delimiteurFin = '\r\x03' // delimiter de fin de séquence de réception de poids
const requetePoids = '$' // texte à envoyer pour demander le poids courant

// Conversion d'un Uint8Array en string : c'est simple puisque c'est de l'ASCII
function u8ToStr(myUint8Arr) {
  return String.fromCharCode.apply(null, myUint8Arr)
}

// Edition des caractères non imprimables STX ETX CR SPACE
function ch(c) {
  if (c === 2) return '\\s'
  if (c === 3) return '\\e'
  if (c === 13) return '\\r'
  if (c === 32) return '^'
  return String.fromCharCode(c)
}

// Impression en clair pour une trace d'une chaîne reçue de la balance
function toDec(str) {
  const v = []
  for (let n = 0, l = str.length; n < l; n++) {
    v.push(ch(str.charCodeAt(n)))
  }
  return v.join(' ')
}

// Flush du port série : pour être certain qu'il n'y a plus rien en buffer interne
function _flush(p, b) {
  return new Promise((resolve, reject) => {
    p.flush((e1) => {
      if (e1) {
        const err = 'Fermeture impossible (flush) de ' + b + ' : ' + e1.message
        console.log(err)
        reject()
      } else {
        resolve()
      }
    })
  })
}

// Fermeture du port série
function _close(p, b) {
  return new Promise((resolve, reject) => {
    p.close((e1) => {
      if (e1) {
        const err = 'Fermeture impossible (flush) de ' + b + ' : ' + e1.message
        console.log(err)
        reject()
      } else {
        resolve()
      }
    })
  })
}

export class Balance {
  /*
    nom : nom système de la balance
    cb : callback invoqué sur changement d'état quand le port est écouté avec 3 arguments :
        arg1 : écoute (true / false)
        arg2 : err : null si ok
        arg3 : nouveau poids en grammes
    */
  constructor(nom, cb) {
    this.callback = cb
    this.nomBalance = nom
    this.poids = 0 // dernier poids reçu de la balance
    this.port = null // port série associé à la balance
    this.timer = null // timer courant de détection que la balance ne répond plus
    this.ecoute = true // quand true on écoute la balance, sinon elle n'est pas à l'écoute
  }

  /*
    A chaque demande du poids courant :
    - on créé un timer pour détecter que la balance ne répond plus. SI UN TIMER eXISTE ENCORE, surtout on le touche pas,
    ça inhiberait la détection précédente. Le timer est supprimé à la réception d'un poids.
    - on envoie "$" à la balance
    */
  _demandePoids() {
    // PRIVATE
    /*
        Texte à envoyer à la balance: $
        Data reçue en réponse : STX 41 32 32 32 48 46 48 48 48 CR ETX
        */
    if (!this.timer) {
      this.timer = setTimeout(() => {
        this._erreur(Error('La balance ' + this.nomBalance + ' ne répond plus'))
      }, delaiDetectionOff)
    }
    // console.log('Demamde poids')
    this.port.write(requetePoids, (err) => {
      if (err) this._erreur(err)
    })
  }

  // Fermeture : par sécurité on flush mais on ignore les erreurs de flush / close
  async _close() {
    // PRIVATE
    if (!this.port || !this.port.isOpen) return
    try {
      await _flush(this.port, this.nomBalance)
      await _close(this.port, this.nomBalance)
    } catch (e) {
      console.log(e)
    }
  }

  /*
    En cas d'erreur :
    - on efface le timer de détection de non réponse
    - on signale l'erreur à l'appelant
    - on ferme le port
    - si on est en écoute, on tente de se reconnecter au bout de 3s
    */
  async _erreur(err) {
    // PRIVATE
    if (!err || !err.message) err = Error('inconnu')

    this.clearTimer()

    const erreur = 'Erreur sur ' + this.nomBalance + ' : ' + err.message
    console.log(erreur)

    if (this.callback) this.callback(this.ecoute, erreur)

    await this._close()

    if (this.ecoute) {
      // est-on en mode écoute
      setTimeout(async () => {
        if (this.ecoute) {
          // testé à nouveau, en 3s l'indicateur a pu changer
          console.log('Tentative de reconnexion de ' + this.nomBalance)
          await this.debutEcoute()
        }
      }, delaiRelanceEcoute)
    }
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  /*
    Connexion au port, début de l'écoute
    */
  async debutEcoute() {
    try {
      this.poids = -1
      this.ecoute = true
      this.clearTimer()
      await this._close() // par sécurité

      this.port = new SerialPort({ path: this.nomBalance, ...options })

      this.parser = this.port.pipe(new DelimiterParser({ delimiter: delimiteurFin }))
      this.port.on('error', (err) => {
        this._erreur(err)
      })
      this.parser.on('data', (data) => {
        this._onData(data)
      })
      // this.port.on('data', (data) => { this._onData(data) })
      this.port.open((err) => {
        if (err) {
          this._erreur(err)
        } else {
          // une fois le port ouvert, on enclenche le pooling de demande de poids
          console.log('Port ' + this.nomBalance + ': ouvert')
          this._demandePoids()
        }
      })
    } catch (err) {
      console.log('ERROR SCALE', err)
    }
  }

  /*
    On a reçu des données : c'est la phrase complète, le parser àa attendu de recevoir le CR de fin
    */
  _onData(data) {
    this.clearTimer() // la balance a répondu, plus la peine de s'inquièter de sa non réponse
    const s = u8ToStr(data)
    // console.log('<' + toDec(s) + '>') // juste une trace pour debug un peu confortable
    const p = Number.parseFloat(s.substring(2)) * 1000
    if (!isNaN(p)) {
      // normalement on doit recevoir un nombre décimal : 10.750 0.432 ...
      if (p !== this.poids) {
        // si la balance a répondu le même poids, l'appelant n'en a cure, ce qui l'intéresse sont les changements de poids
        this.poids = p
        // console.log('< ' + p + ' >')
        this.callback(this.ecoute, null, this.poids)
      }
    } else {
      console.log('Port ' + this.nomBalance + ': poids <' + toDec(s) + '>')
    }
    setTimeout(() => {
      // on a reçu un poids, si on est toujours à l'écoute, on fait une nouvelle demande après un court délai
      if (this.ecoute) {
        // si on est toujours à l'écoute (il s'est passé 0,5s), on fait la nouvelle demande
        this._demandePoids()
      }
    }, delaiDemandePoids)
  }

  /*
    L'appelant ne veut plus être à l'écoute. On ferme tout
    */
  async finEcoute() {
    this.clearTimer()
    this.ecoute = false
    this.callback(false)
    await this._close()
  }
}

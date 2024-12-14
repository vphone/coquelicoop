/*
Gestion d'une balance Gram XFOC S2
Pour lui demander le poids courant envoyer: STX(2) $ ETX(3)
On reçoit (pour 176g) : STX(2) !  space space space 0 . 1 7 6 CR(13) ETX(3)
Si poids 0, on a ) au lieu de !

Une instance de classe Balance par balance (bien qu'on n'en ait qu'une).
La réception des changements de poids ne s'obtient pas en une seule lecture, d'où un protocole un peu complexe.
Le principe est de pooler la balance en lui demandant son poids courant toutes les 0,5s (delayWeightRequest)
Il se peut que la balance soit off ou ait été éteinte :
quand on lui demande son pods courant si au bout de 1s (delayScaleOff) elle n'a pas répondu
elle est considérée comme ayant été éteinte.
Pour la connexion (en fait se mettre à l'écoute) en cas d'échec on essaie 3s (delayListener) plus tard.
*/

import { remote } from 'electron'

/*
Le require de serialport DOIT être fait dans le process principal en electron
Malgré cela en test ça ne marche bien que la première fois. Quasar dev relance des connexions et
ça perturbe grave la balance. Il faut relancer l'appli.
*/

const { SerialPort } = remote.require('serialport')
const { DelimiterParser } = remote.require('@serialport/parser-delimiter')

const delayWeightRequest = 1500
const delayScaleOff = 2000
const delayListener = 5000
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

export class Scale {
  /*
    id : nom système de la balance
    cb : callback invoqué sur changement d'état quand le port est écouté avec 3 arguments :
        arg1 : écoute (true / false)
        arg2 : err : null si ok
        arg3 : nouveau poids en grammes
    */
  constructor(id, cb) {
    this.callback = cb
    this.identifierScale = id
    this.weight = 0 // dernier poids reçu de la balance
    this.port = null // port série associé à la balance
    this.timer = null // timer courant de détection que la balance ne répond plus
    this.listener = true // quand true on écoute la balance, sinon elle n'est pas à l'écoute
  }

  /*
    A chaque demande du poids courant :
    - on créé un timer pour détecter que la balance ne répond plus. SI UN TIMER eXISTE ENCORE, surtout on le touche pas,
    ça inhiberait la détection précédente. Le timer est supprimé à la réception d'un poids.
    - on envoie "$" à la balance
    */
  _weightRequest() {
    /*
        Texte à envoyer à la balance: $
        Data reçue en réponse : STX 41 32 32 32 48 46 48 48 48 CR ETX
        */
    if (!this.timer) {
      this.timer = setTimeout(() => {
        this._error(Error('La balance ' + this.identifierScale + ' ne répond plus'))
      }, delayScaleOff)
    }
    this.port.write(requetePoids, (err) => {
      if (err) this._error(err)
    })
  }

  // Fermeture : par sécurité on flush mais on ignore les erreurs de flush / close
  async _flushAndClose() {
    if (!this.port || !this.port.isOpen) return
    try {
      await _flush(this.port, this.identifierScale)
      await _close(this.port, this.identifierScale)
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
  async _error(err) {
    if (!err || !err.message) err = Error('inconnu')
    this.clearTimer()
    const errText = 'Erreur sur ' + this.identifierScale + ' : ' + err.message
    if (this.callback) this.callback(this.listener, errText)

    await this._flushAndClose()

    if (this.listener) {
      // est-on en mode écoute
      setTimeout(async () => {
        if (this.listener) {
          // testé à nouveau, en 3s l'indicateur a pu changer
          console.log('Tentative de reconnexion de ' + this.identifierScale)
          await this.debutEcoute()
        }
      }, delayListener)
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
      this.weight = -1
      this.listener = true
      this.clearTimer()
      await this._flushAndClose() // par sécurité

      this.port = new SerialPort({ path: this.identifierScale, ...options })

      this.parser = this.port.pipe(new DelimiterParser({ delimiter: delimiteurFin }))
      this.port.on('error', (err) => {
        this._error(err)
      })
      this.parser.on('data', (data) => {
        this._onData(data)
      })
      this.port.open((err) => {
        if (err) {
          this._error(err)
        } else {
          // une fois le port ouvert, on enclenche le pooling de demande de poids
          console.log('Port ' + this.identifierScale + ': ouvert')
          this._weightRequest()
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
    const p = Number.parseFloat(s.substring(2)) * 1000
    if (!isNaN(p)) {
      // normalement on doit recevoir un nombre décimal : 10.750 0.432 ...
      if (p !== this.weight) {
        // si la balance a répondu le même poids, l'appelant n'en a cure, ce qui l'intéresse sont les changements de poids
        this.weight = p
        this.callback(this.listener, null, this.weight)
      }
    } else {
      console.log('Port ' + this.identifierScale + ': poids <' + toDec(s) + '>')
    }
    setTimeout(() => {
      // on a reçu un poids, si on est toujours à l'écoute, on fait une nouvelle demande après un court délai
      if (this.listener) {
        // si on est toujours à l'écoute (il s'est passé 0,5s), on fait la nouvelle demande
        this._weightRequest()
      }
    }, delayWeightRequest)
  }

  /*
    L'appelant ne veut plus être à l'écoute. On ferme tout
    */
  async finEcoute() {
    this.clearTimer()
    this.listener = false
    this.callback(false)
    await this._flushAndClose()
  }
}

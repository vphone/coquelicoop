/*
Génération du texte de l'étiquette en langage ZPL
*/

import { formatPoids } from '../utils'
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const fs = require('fs')
const path = require('path')

/*
Le template ZPL peut être donné dans la configuration à la place de celui par défaut :
La marge m est donnée à part dans marge (210 par défaut) pour centrer plus facilement
le texte sur l'étiquette selon sa largeur.
*/

// Ecriture de data dans un fichier : étiquette à imprimer
async function write(p, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(p, data, 'utf-8', (err) => {
      if (!err) {
        resolve()
      } else {
        reject(err)
      }
    })
  })
}

/*
Imprimer consiste en deux commandes différentes en Windows et Linux
En Windows : il faut copier le fichier sur le nom de partage sur localhost de l'imprimante
ayant été installée avec le driver texte simple standard générique
En Linux : c'est le lpr -l -P du fichier
Dans les deux cas le fichier a été écrit auparavant sous un path générique dans le répertoire de travail
En test le fichier est recopié en tmp. C'est inutile, juste pour tester qu'on sait soumettre une commande.
Retourne null si OK, sinon stderr.
*/
async function print(p, impr) {
  let cmd
  if (process.platform === 'win32') {
    if (impr) {
      cmd = `COPY "${p}" "\\\\localhost\\${impr}"`
    } else {
      // pour tester en l'absence d'imprimante
      cmd = `COPY "${p}" "C:\\tmp\\etiquette.zpl"`
    }
  } else if (process.platform === 'linux') { 
    if (impr) {
      cmd = `lpr -l -P "${impr}" "${p}"`
    } else {
      // pour tester en l'absence d'imprimante
      cmd = `cp "${p}" "/tmp/etiquette.zpl"`
    }
  } else if (process.platform === 'darwin') { 
    if (impr) {
      cmd = `lp "${impr}" "${p}"`
    } else {
      // pour tester en l'absence d'imprimante
      cmd = `cp "${p}" "/tmp/etiquette.zpl"`
    }
  }
  
  const { stdout, stderr } = await exec(cmd)
  if (stderr) {
    console.log('stdout:', stdout)
    console.log('stderr:', stderr)
    return stderr
  } else {
    return null
  }
}

const options = { year: '2-digit', month: '2-digit', day: '2-digit' }
/*
Demande d'impression d'une étiquette
pese : true si le poids est pesé, sinon saisi
article : l'article lui-même
poidsB : c'est soit le poids, soit le nombre de pièces
poidsC : poids du contenant
Le rouleau de papier est centré au milieuu de l'imprimante :
si on écrit depuis 0 en x, on va écrire hors du rouleau à gauche dès qu'il n'a pas la taille maximale.
La "marge à gauche" est laissée paramétrable pour s'adapter à la largeur exacte du papier
voire des imprimantes. 220 paraît une bonne approximation pour être centré
*/
export async function etiquette(pese, article, poidsB, poidsC, ean) {
  console.log(pese, article, poidsB, poidsC, ean)
  try {
    let type
    let prix
    let prixk
    let poidsTare
    let date
    let m = 20

    let net = poidsC ? poidsB - poidsC : poidsB

    if (article.unite === 'kg') {
      type = pese ? 'Poids Net' : 'Poids SAISI'
      if (poidsC) type += '+Tare'
      poidsTare = formatPoids(net) + (poidsC ? '+' + formatPoids(poidsC) : '')
    } else {
      type = 'Nombre de pièces'
      poidsTare = '' + poidsB
    }
    if (!article.prixN) {
      prix = '?'
    } else {
      if (article.unite === 'kg') {
        prixk = ('' + article.prixN).replace('.', ',') + '€/Kg'
        prix = ('' + Math.round((article.prixN * net) / 10) / 100).replace('.', ',') + '€'
      } else {
        prix = ('' + article.prixN * net).replace('.', ',') + '€'
        prixk = ''
      }
    }
    date = new Date().toLocaleDateString('fr-FR', options).replace(/\./g, '/')
    if (ean.substring(7, 12) === '99999') return '99999'
    // texte de l'étiquette en ZPL : format 50mm x 40mmm
    // eslint-disable-next-line no-eval
    let etiq = `^XA\n^CI28\n^CF0,0,30\n^FO${m + 10},15,0^FD${article.nom1}^FS\n^FO${
      m + 10
    },45,0^FD${article.nom2}^FS\n^CF0,0,20\n^FO${m + 10},80,0^FD${prixk}^FS\n^FO${
      m + 120
    },80,0^FD${type}^FS\n^FO${m + 340},80,0^FDPesé le^FS\n^CF0,0,28\n^FO${
      m + 10
    },100,0^FD${prix}^FS\n^FO${m + 120},100,0^FD${poidsTare}^FS\n^CF0,0,20\n^FO${
      m + 340
    },100,0^FD${date}^FS\n^FO${m + 70},140^BY3,2,20^BEN,60,Y,N^FD${ean}^FS\n^XZ\n`
    console.log(type, prix, prixk, poidsTare, m, date)

    // path du fichier à impimer
    const dir = path.normalize('./src/app/')
    console.log(dir)
    let p = path.join(dir, 'etiquette.zpl')
    // écriture du texte en ZPL sur ce fichier
    await write(p, etiq)
    // envoi à l'imprimante selon l'OS
    return print(p, process.env.VUE_APP_PRINTER)
  } catch (err) {
    console.log('ERR PRINT ZPL', err)
  }
}
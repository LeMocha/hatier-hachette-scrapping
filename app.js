// Import des paquets
const puppeteer = require('puppeteer');
const readline = require("readline");
var fs = require('fs');


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Attention ! Pensez à vider le dossier result dans lesquels sont stockés les manuels téléchargés, sinon ils seront écrasés !\nQuel est le lien du manuel que vous souhaitez télécharger ?\n", async (ul) => {

  const app = async (user_link) => {
    let url = ""
    let nice = 0
    try {
      // Création de l'instance.
      console.info("Obtention du lien de téléchargement...")
      const browser = await puppeteer.launch();
      const [page] = await browser.pages();

      // À chaque réponse reçue des serveurs hachette, le script vérifie s'il correspond au lien qu'il cherche
      page.on('response', response => {
        if (nice == 1) return

        let exobank = /https:\/\/exobank\.hachette\-livre\.fr\/contents\/final\/[a-z0-9-.]+/i;

        if (exobank.test(response.url())) {
          nice = 1
          url = response.url().slice(0, -33)
          console.info("Lien de Téléchargement Obtenu ! ",url)
        }
        else {
          return
        }
      });

      // Accès au lien fourni par l'utilisateur
      await page.goto(user_link);

      let i = 1
      let fin = 0

      // Reglage de la taille de l'instance
      await page.setViewport({ width: 594, height: 810, deviceScaleFactor: 4 });

      // Si la page n'est pas trouvée, le téléchargement du manuel est terminé
      page.on('response', async (response) => {
        if (response.status() == 404) {
          fin = 1
        }
      })

      // Vérification de l'existance du dossier "result" s'il n'existe pas on le créé
      var dir = './result';
      if (!fs.existsSync(dir)){
        console.info("Le dossier result n'existe pas. Création du dossier...")
        fs.mkdirSync(dir);
      }

      // Tant que le téléchargement n'est pas terminé
      do {
        console.log(`Téléchargement de la Page ${i}...`)

        // Navigation vers l'URL souhaitée
        res = await page.goto(`${url}Page_${i}.html`)

        // Screenshot de la page
        await page.screenshot({ path: `./result/Page_${i}.png` })
        console.log(`Page ${i} téléchargée !`)
        i++

      } while (fin == 0)

      /* Certains manuels sont enregistrés au format xhtml au lieu du html. Si c'est le cas,
      l'état du nb. de page téléchargé sera à 2 et le manuel considéré comme téléchargé.
      Alors le script reprend le téléchargement avec cette fois-ci le bon format de lien.*/ 
      if(i == 2){
        // Reglage de la taille de l'instance
        await page.setViewport({ width: 1540, height: 2050, deviceScaleFactor: 1 });

        let i = 1
        let fin = 0

        do {
          console.log(`Téléchargement de la Page ${i}...`)
  
          // Navigation vers l'URL souhaitée
          res = await page.goto(`${url}page${i}.xhtml`)
  
          // Screenshot de la page
          await page.screenshot({ path: `./result/Page_${i}.png` })
          console.log(`Page ${i} téléchargée !`)
          i++
  
        } while (fin == 0)
      }

      // Fermeture du programme
      await browser.close()
      console.info("Téléchargement du manuel terminé !")
      process.exit(0);

    } catch (err) {
      console.error("Une erreur s'est produite.");
    }
  };

  app(ul);

});
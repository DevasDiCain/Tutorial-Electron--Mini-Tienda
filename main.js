const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu , ipcMain} = electron;

// SET ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

//Escuchar la app cuando esté lista
app.on('ready', function(){
  //creamos la ventana
  mainWindow = new BrowserWindow({
    webPreferences: { nodeIntegration: true }
  });

  //cargamos el html en la ventana

  mainWindow.loadURL(url.format({
      pathname: path.join(__dirname,'mainWindow.html'),
      protocol:'file:',
      slashes:true
  }));
  //Aquí construimos el menú para plantillas
 const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  //lo insertamos
  Menu.setApplicationMenu(mainMenu);
  
  //Cuando se cierre la ventana principal se cierra la app entera
mainWindow.on('closed',function(){
  app.quit();
});
   //Capturar click derecho para menú contextual

   mainWindow.webContents.on('context-menu',(e,args)=>{
    mainMenu.popup(mainWindow);
  })
})

//Método que creará ventanas
function createAddWindow(){
   //creamos la ventana
   addWindow = new BrowserWindow({
     width:300,
     height:200,
     title:'Añadir un objeto a la lista',
     webPreferences: { nodeIntegration: true }
   
   });
   //cargamos el html en la ventana
   addWindow.loadURL(url.format({
       pathname: path.join(__dirname,'addWindow.html'),
       protocol:'file:',
       slashes:true
   }));
   //Liberamos memoria cuaando se cierre el popup
   addWindow.on('close', function(){
     addWindow = null;
   })
}

// Capturar evento en renderer (item:add)
ipcMain.on('item:add',function(e,item){
    mainWindow.webContents.send('item:add',item);
    addWindow.close();
})

//Vamos a crear el menu
//Que no es más que un array de objetos
const mainMenuTemplate = [
{
  label:'Opciones',
  submenu:[
    {
      label: 'Añadir Objeto',
      click(){
        createAddWindow();
      }
    },
    {
      label:'Limpiar cesta',
      click(){
        mainWindow.webContents.send('item:clear');
      }
    },
    {
      label:'Salir',
      //Aquí añado un shortcut, dependiendo del so donde se ejecute
      accelerator: process.plataform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
      click(){
        app.quit();
      }
    }
  ]
}
];
//Si es mac, añade un objeto vacío al menú
if(process.plataform == 'darwin'){
  mainMenuTemplate.unshift({});
}

//Añadir herramientas de desarrollador si no  está en produccion
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Herramientas de desarrollo',
    submenu:[
      {
      label:'Toggle DevTools',
      accelerator: process.plataform == 'darwin' ? 'Command+I' : 'Ctrl+I',
      click(item,focusedWindow){
        focusedWindow.toggleDevTools();
         }
      },
      {
      role:'reload'
     }
  ]
  });
}
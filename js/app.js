/** Elemento HTML global */
let HTMLMain;
const defaultCombat = {
  FightersList:  [],
  InitiativeList: [],
  LifeList: [],
  TurnControl: {
    turno: 0,
    fighterPos: 999999999,
    fighterName: "",
    mode: 0,
    nombre: "Nuevo combate"
  }
}
const AppData = {
  selected: 0,
  combats: [{...defaultCombat}]
};
/** Elementos HTML */
let htmlInpNomCo = null;
let htmlNumTurno = null;
let htmlBtnTurno = null;
let htmlStatsData = null;
let htmlLogoDado = null;
function newCombat(){ 
  const nCombat = {
    FightersList:  [],
    InitiativeList: [],
    LifeList: [],
    TurnControl: {
      turno: 0,
      fighterPos: 999999999,
      fighterName: "",
      mode: 0,
      nombre: "Nuevo combate"
    }
  }
  AppData.combats.push(nCombat);
  //AppData.selected = AppData.combats.length - 1;
  htmlBtnTurno.innerHTML = "INICIAR";
  updateTurn();
};
function clearCombat(){
  if (AppData.combats[AppData.selected].InitiativeList.length === 0) return;
  if (!confirm(`Esta acción eliminará todos los combatientes y reiniciará el combate entero.
  
  ¿Quieres hacerlo igualmente?`)) return;
  AppData.combats[AppData.selected].FightersList.splice(0, AppData.combats[AppData.selected].FightersList.length);
  AppData.combats[AppData.selected].InitiativeList.splice(0, AppData.combats[AppData.selected].InitiativeList.length);
  AppData.combats[AppData.selected].LifeList.splice(0, AppData.combats[AppData.selected].LifeList.length);
  AppData.combats[AppData.selected].FightersList.length = 0;
  AppData.combats[AppData.selected].InitiativeList.length = 0;
  AppData.combats[AppData.selected].LifeList.length = 0;
  AppData.combats[AppData.selected].TurnControl.turno = 0;
  AppData.combats[AppData.selected].TurnControl.fighterPos = 999999999;
  AppData.combats[AppData.selected].TurnControl.fighterName = "";
  AppData.combats[AppData.selected].TurnControl.mode = 0;
  htmlBtnTurno.innerHTML = "INICIAR";
  updateTurn();
};
function restartCombat(){
  if(AppData.combats[AppData.selected].TurnControl.mode === 0) return;
  if (!confirm(`Esta acción reiniciará el combate.
  
  ¿Quieres hacerlo igualmente?`)) return;
  AppData.combats[AppData.selected].TurnControl.turno = 0;
  if(AppData.combats[AppData.selected].InitiativeList.length>0) {
    AppData.combats[AppData.selected].TurnControl.fighterName = AppData.combats[AppData.selected].InitiativeList[0].sFullName();
    AppData.combats[AppData.selected].TurnControl.fighterPos = AppData.combats[AppData.selected].InitiativeList[0].iControlInit;
  } else 
  AppData.combats[AppData.selected].TurnControl.fighterName = "";
  AppData.combats[AppData.selected].TurnControl.fighterPos = 999999999;
  AppData.combats[AppData.selected].TurnControl.mode = 0;
  htmlBtnTurno.innerHTML = "INICIAR";
  updateTurn();
};
function selectCombat(index){
  AppData.selected = index;
  updateTurn();
};
function deleteCombat(index){
  if (AppData.combats.length===1) return;
  if (!confirm(`Esta acción eliminará el combate.
  
  ¿Quieres hacerlo igualmente?`)) return;  
  if (index===AppData.combats.length - 1) 
    AppData.selected = AppData.combats.length - 2;
  AppData.combats.splice(index, 1);
  updateTurn();
};
function saveLocal(){
  localStorage.setItem("cmc-combats", 
    JSON.stringify(AppData));
}
function loadLocal(){
  let jsonAppData;
  if(localStorage.getItem("cmc-combats")!=null) {
    jsonAppData = JSON.parse(localStorage.getItem("cmc-combats"));
      AppData.selected = jsonAppData.selected;
      AppData.combats = []
      jsonAppData.combats.forEach((loadedCombat, index) => {
        const newCombat = {
          FightersList:  [],
          InitiativeList: [],
          LifeList: [],
          TurnControl: loadedCombat.TurnControl
        }
        htmlInpNomCo.value = loadedCombat.TurnControl.nombre
        loadedCombat.FightersList.forEach(element => {
          const newFighter = new fighter("A", "0", "0", false, 0, 0);
          newFighter.sName = element.sName;
          newFighter.iInit_bon = element.iInit_bon;
          newFighter.iInit_value = element.iInit_value;
          newFighter.iBono_control = element.iBono_control;
          newFighter.iInit_control = element.iInit_control;
          newFighter.bPje = element.bPje;
          newFighter.iNumRep = element.iNumRep;
          newFighter.iPG = element.iPG;
          newFighter.iLife = element.iLife;
          newFighter.iSH = element.iSH;
          newFighter.iShld = element.iShld;
          newFighter.iRS = element.iRS;
          newFighter.iBL = element.iBL;
          newFighter.iBS = element.iBS;
          newFighter.iDesEmpInit = element.iDesEmpInit;
          newFighter.iControlInit = element.iControlInit;
          element.states.forEach(eleState => {
            const newState = new state(eleState.iIcon,
                                     eleState.sName,
                                     eleState.sDesc,
                                     eleState.bInca,
                                     eleState.iTurnos,
                                     newFighter.sFullName(),
                                     eleState.iInit,
                                     eleState.fighterDone);
            newFighter.states.push(newState);
          });
          
          newCombat.FightersList.push(newFighter);
          newCombat.InitiativeList.push(newFighter);
          newCombat.LifeList.push(newFighter);
        })
        newCombat.InitiativeList.sort(fighter.sortByInit);
        newCombat.LifeList.sort(fighter.sortByName);        
        AppData.combats.push(newCombat);
      });  
  }
}
function changeCombatTitle(){
  AppData.combats[AppData.selected].TurnControl.nombre = htmlInpNomCo.value;
  updateTurn();
};
function updateTurn(){
  if(AppData.combats[AppData.selected].TurnControl.mode===0) {
    AppData.combats[AppData.selected].TurnControl.fighterName = "";
    AppData.combats[AppData.selected].TurnControl.fighterPos = 999999999;
    htmlNumTurno.innerHTML = "Prep.";
  } else {
    htmlNumTurno.innerHTML = `${AppData.combats[AppData.selected].TurnControl.turno}`;
  }
  showFighters();
  showLife();
  showInitiative();
  showCombats();
  saveLocal();
};

function findNextFighter(){
  const promise = new Promise((resolve, reject) => {
    let fighterFind = "";
    if(AppData.combats[AppData.selected].FightersList.length>0) {
      htmlBtnTurno.innerHTML = "SIGUIENTE";
      if(AppData.combats[AppData.selected].TurnControl.mode===0) {
        AppData.combats[AppData.selected].TurnControl.mode = 1;
        AppData.combats[AppData.selected].TurnControl.fighterPos = AppData.combats[AppData.selected].InitiativeList[0].iControlInit;
        AppData.combats[AppData.selected].TurnControl.fighterName = AppData.combats[AppData.selected].InitiativeList[0].sFullName();
        if (AppData.combats[AppData.selected].InitiativeList[0].checkStates()) nextFighter();
      } else {
        do {
          if(AppData.combats[AppData.selected].TurnControl.fighterPos < AppData.combats[AppData.selected].InitiativeList[AppData.combats[AppData.selected].InitiativeList.length-1].iControlInit) {
              AppData.combats[AppData.selected].TurnControl.fighterPos = AppData.combats[AppData.selected].InitiativeList[0].iControlInit + 1;
              // Si encuentra un estado con iTurnos a 0 i que la iInit es
              // superior al primer combatiente, elimina esos estados
              AppData.combats[AppData.selected].FightersList.forEach(oFighter => {
                oFighter.states.forEach(oState => {
                  if(oState.iInit > AppData.combats[AppData.selected].TurnControl.fighterPos) oState.iTurnos--;
                  if(oState.iTurnos <= 0) oFighter.cleanStates();
                })
              });
              AppData.combats[AppData.selected].TurnControl.fighterName = "";
              AppData.combats[AppData.selected].TurnControl.turno++;
            } else {
              AppData.combats[AppData.selected].TurnControl.fighterPos--;
              fighterFind = getFighterByInit(AppData.combats[AppData.selected].TurnControl.fighterPos);
              /** Busca todos los estados que los haya causado esta iniciativa */
              AppData.combats[AppData.selected].FightersList.forEach(oFighter => {
                oFighter.states.forEach(oState => {
                  if(oState.iInit === AppData.combats[AppData.selected].TurnControl.fighterPos) oState.iTurnos--;
                  if(oState.iTurnos <= 0) oFighter.cleanStates();
                })
              });
            }
          } while (fighterFind==="");
          AppData.combats[AppData.selected].TurnControl.fighterName = fighterFind;
          getFighterByName(AppData.combats[AppData.selected].TurnControl.fighterName).startTurn();
          if (getFighterByName(fighterFind).checkStates()) nextFighter();
      }
      resolve();
    } else reject();
  });
  return promise;
}
function nextFighter(){
  htmlLogoDado.classList.add("mark-animate-icon");
  setTimeout(()=>{ 
    findNextFighter()
    .then(()=>{
      updateTurn();
      htmlLogoDado.classList.remove("mark-animate-icon");
    })
    .catch(()=>{
      htmlLogoDado.classList.remove("mark-animate-icon");
    })
  }, 100);
};
/** Otras variables globales */
const AppTestMode = false;
const WidthResponsive = 750;
let lastwindowwidth = 0;
let fighterPanelClosed = false;
/** Otras funciones generales */
function toggleFightersPanel(){
  fighterPanelClosed = !fighterPanelClosed;
  updateTurn();
};
/******** clase ESTADO Alterado **********/
const standardStates = [
  {
    icon: 0,
    name: '- Personalizado -',
    desc: '',
    inca: false
  },
  {
    icon: 1,
    name: 'Apresado',
    desc: 'Pierde el bonificador de destreza a la CA. Tiene un límite de acciones que puede emprender.',
    inca: false
  },
  {
    icon: 2,
    name: 'Asustado',
    desc: '-2 a las tiradas de ataque, TS, habilidades y características. Huye del origen de su miedo, puede usar magia o aptitudes especiales para huir. Si es acorralado, queda {Aterrado}.',
    inca: false
  },
  {
    icon: 3,
    name: 'Aterrado',
    desc: '-2 a CA y pierde todo el bono de destreza. Se queda helado de miedo y no puede realizar ninguna acción.',
    inca: true
  },
  {
    icon: 4,
    name: 'Atontado',
    desc: 'No puede realizar ninguna acción. No sufre penalización a la CA.',
    inca: true
  },
  {
    icon: 5,
    name: 'Aturdido',
    desc: '-2 a CA y pierde todo el bono de destreza. Deja caer objetos y no puede realizar acciones.',
    inca: true
  },
  {
    icon: 6,
    name: 'Consunción de característica temporal',
    desc: 'El jugador pierde X puntos de X característica',
    inca: false
  },
  {
    icon: 7,
    name: 'Cegado',
    desc: '-2 a CA y pierde todo el bono de destreza. La velocidad se reduce a la mitad. Recibe -4 a Buscar y pruebas basadas en fuerza y destreza. Acciones que dependan de la vista, fallan. Todos los enemigos tienen ocultación 50%.',
    inca: false
  },
  {
    icon: 8,
    name: 'Confuso',
    desc: 'No sufre penalizador pero no puede realizar ataques de oportunidad.<br>Tabla de tiradas:<br>  1-10: Ataca al lanzador CC<br> 11-20: Actua normal<br> 21-50: Balbucea incoherencias<br> 51-70: Huye del lanzador<br>71-100: Ataca a la criatura más cercana',
    inca: false
  },
  {
    icon: 9,
    name: 'Deslumbrado',
    desc: '-1 a la tiradas de ataque, Avistar y Buscar',
    inca: false
  },
  {
    icon: 10,
    name: 'Despavorido',
    desc: '-2 a las tiradas de ataque, TS, habilidad y característica. Deja caer objetos y huye del origen de su miedo y cualquier amenaza. Puede usar magia o aptitudes especiales para huir. Si es acorralado, queda {Aterrado}.',
    inca: false
  },
  {
    icon: 11,
    name: 'Consunción de nivel',
    desc: 'La criatura pierde X niveles.',
    inca: false
  },
  {
    icon: 12,
    name: 'Estremecido',
    desc: '-2 a las tiradas de ataque, TS, habilidad y característica.',
    inca: false
  },
  {
    icon: 13,
    name: 'Fatigado',
    desc: '-2 a Fuerza y Destreza. No puede correr ni cargar.',
    inca: false
  },
  {
    icon: 14,
    name: 'Incorporal',
    desc: 'Inmune a cualquier ataque no mágico.',
    inca: false
  },
  {
    icon: 15,
    name: 'Invisible',
    desc: '+2 a las tiradas de ataque y ignora el bonificador de Destreza a la CA de los enemigos.',
    inca: false
  },
  {
    icon: 16,
    name: 'Mareado',
    desc: 'Incapaz de atacar, lanzar conjuros y concentrarse. Solo puede hacer una acción de movimiento.',
    inca: false
  },
  {
    icon: 17,
    name: 'Paralizado',
    desc: 'Puntuación de Fuerza y Destreza a 0. Es incapaz de moverse o actuar. Está indefenso.',
    inca: true
  },
  {
    icon: 18,
    name: 'Petrificado',
    desc: 'Se considera inconsciente. Se ha convertido en piedra.',
    inca: true
  },
  {
    icon: 19,
    name: 'Tumbado',
    desc: '-4 a las tiradas de ataque y no puede usar armas a distancia. +4 a CA contra ataques a distancia. -4 a CA contra ataques CC.',
    inca: false
  },
  {
    icon: 20,
    name: 'Protecciones saturadas',
    desc: 'Las protecciones están saturadas y no pueden protegerte.',
    inca: false
  },
  {
    icon: 21,
    name: 'Anclado',
    desc: 'Puntuación de Fuerza y Destreza a 0. Es incapaz de moverse o actuar y se queda bloqueado en la posición  aunque no tenga apoyo alguno . No pede ser desplazado. Está indefenso.',
    inca: true
  },
  {
    icon: 22,
    name: 'Ardiendo',
    desc: 'Un personaje ardiendo sufre 1d6 puntos de daño por fuego cada asalto en su turno.',
    inca: false
  },
  {
    icon: 23,
    name: 'Congelado',
    desc: 'Puntuación de Fuerza y Destreza a 0. Incapaz de moverse o actuar. Su cuerpo se queda hecho un bloque de hielo. Doble de daño por contundente o daño por fuego, la mitad por cortante y no puede sufrir daño de una fuente física punzante.',
    inca: true
  },
  {
    icon: 24,
    name: 'Electrizado',
    desc: 'Una criatura electrizada no puede realizar ninguna acción si falla un TS de Voluntad. Si salva el TS, sigue electrizada, pero puede  intentar descargarse.',
    inca: false
  },
  {
    icon: 25,
    name: 'Elevado',
    desc: 'Toda criatura elevada está también zero-imbuida. No puede cambiar de posición a voluntad, falla automáticamente  TS de reflejos, penalizador de -4  a  sus ataques y sólo puede realizar acciones parciales.',
    inca: false
  },
  {
    icon: 26,
    name: 'Zero-imbuido',
    desc: 'Recibe un penalizador de -1 a TS contra poderes bióticos y sus escudos no pueden recuperar puntos de golpe ni ser reactivados. No se conocen mecanismos para dejar de estar en este estado.',
    inca: false
  },
  {
    icon: 27,
    name: 'Recarga de poder',
    desc: 'No puede utilizar poderes. Se están recargando.',
    inca: false
  } 
]
class state {
  constructor( iIcon,
               sName,
               sDesc,
               bInca,
               iTurnos,               
               fighterName,
               iInit,
               fighterDone) {
    this.iIcon = iIcon;
    this.sName = sName;
    this.sDesc = sDesc;
    this.bInca = bInca;
    this.iTurnos = iTurnos;
    this.fighterName = fighterName;
    /** <iInit> momento de la iniciativa en la que dejarà
     * de estar en el estado alterado
     */
    this.iInit = iInit;
    /** <FighterDone> es el nombre del fighter que estaba
     * en iniciativa quando se le ha puesto el estado
     * alterado. Si se modifica el estado alterado, se
     * selecciona al fighter, pero en realidad el valor que 
     * se necesita es el valor iControlInit, que determina
     * en qué momento el estado dejará de surtir efecto, dato
     * que guardaremos en iInit
     */
    this.fighterDone = fighterDone;
  }
  sFormatedInit() {
    let iD = 0;
    let iB = 0;
    let iT = 0;
    if(this.iInit===undefined) this.iInit = 0;
    iT = Math.floor(this.iInit / 1000000)
    iB = Math.floor((this.iInit-iT*1000000)/1000)
    iD = this.iInit-iT*1000000-iB*1000
    return `${iT-100}.${iB-100}.${iD}`
  }
  showStateInEdit(divOpac){
    const divS = document.createElement("div");
    divS.classList.add("state-frame");

    const pName = document.createElement("p");
    pName.classList.add("state-name");
    pName.innerHTML = `${this.sName} ${(this.bInca?' [X] ':' ')}`;
    const pTurn = document.createElement("p");
    pTurn.classList.add("state-turn");
    pTurn.innerHTML = `${this.iTurnos}`;
    const divE = document.createElement("div");
    divE.classList.add("state-edit");
    divE.addEventListener("click", ()=>{
      divOpac.remove();
      const oFighter = getFighterByName(this.fighterName);
      formEditState(oFighter, this, this.iIcon, this.fighterDone);
    })
    const divD = document.createElement("div");
    divD.classList.add("state-delete");
    divD.addEventListener("click", ()=>{
      divOpac.remove();
      const oFighter = getFighterByName(this.fighterName);
      oFighter.states = oFighter.states.filter(e => e!==this);
      formEditFighter(oFighter);
    })
    if(this.fighterDone===undefined) this.fighterDone=''
    const pDesc = document.createElement("p");
    pDesc.classList.add("state-desc");
    pDesc.innerHTML = `Causante: ${this.fighterDone} (${this.sFormatedInit()})<BR>
                      ${this.sDesc}`;    
    pDesc.innerHTML = `Causante: ${this.fighterDone} (${this.sFormatedInit()})`;    
    
    divS.appendChild(pName);
    divS.appendChild(pTurn);
    divS.appendChild(divE);
    divS.appendChild(divD);
    divS.appendChild(pDesc);

    return divS;
  };
  showStateInInit(){
    const divS = document.createElement("div");
    divS.classList.add("state-init-frame");

    const pName = document.createElement("p");
    pName.classList.add("state-name");
    pName.innerHTML = `${this.sName} ${(this.bInca?'[X] ':' ')}`;
    
    const pTurn = document.createElement("p");
    pTurn.classList.add("state-turn");
    pTurn.innerHTML = `${this.iTurnos}`;
    
    const pDesc = document.createElement("p");
    pDesc.classList.add("state-desc");
    pDesc.innerHTML = `Causante: ${this.fighterDone} (${this.sFormatedInit()})<br>
                                 ${this.sDesc}`;     
    
    divS.appendChild(pName);
    divS.appendChild(pTurn);
    divS.appendChild(pDesc);

    return divS;
  };
  divIcon(){
    let divS = document.createElement("div");
    divS.classList.add(`init-state`);
    divS.style.backgroundImage = `url(../img/icons/state-${this.iIcon}.svg)`
    divS.innerHTML = "&nbsp;";
    return divS;
  }
};
/******** clase FIGHTER **********/
class fighter {
  constructor( sName, 
               sBono, 
               sInit,
               bPje,
               iNumRep,
               iPG,
               iSH,
               iRS,
               iBL,
               iBS
               ) {
    this.sName = sName;
    this.iInit_bon = 0;
    this.iInit_value = 0;
    this.iBono_control = 0;
    this.iInit_control = 0;
    this.bPje = bPje;
    this.iBL = iBL;
    this.iBS = iBS;
    this.iNumRep = iNumRep;
    this.iPG = iPG;
    this.iLife = iPG;
    this.iSH = iSH;
    this.iShld = iSH;
    this.iRS = iRS
    this.iDesEmpInit = (bPje?999:Math.floor(Math.random()*1000));
    this.iControlInit = 0;
    this.states = new Array();
    this.setBono(sBono);
    this.setInit(sInit);
    this.UpdateControlInit();
  }
  // variables compuestas
  sFullName(){
    if (this.bPje) return this.sName;
    return `${this.sName} ${this.iNumRep}`;
  };
  sInitiative(){
    if (AppTestMode) return `${this.iInit_value}.${this.iInit_bon}.${this.iDesEmpInit}`;
    return `${this.iInit_value}`;
  };
  sInitiativeLarge(){
    return `${this.iInit_value}.${this.iInit_bon}.${this.iDesEmpInit}`;
  };
  UpdateControlInit(){
    this.iControlInit = (this.iInit_control * 1000000) +
                        (this.iBono_control * 1000) + 
                        (this.iDesEmpInit);
  };
  //actualizaciones de iniciativa
  setBono(sBono){
    if(sBono==="") sBono="0";
    this.iInit_bon = parseInt(sBono);
    if(this.iInit_bon>899) this.iInit_bon=899;
    this.iBono_control = parseInt(sBono) + 100;
    if(this.iBono_control>999) this.iBono_control=999;
    this.UpdateControlInit();
  };
  setInit(sInit){
    if(sInit==="") sInit="0";
    this.iInit_value = parseInt(sInit);
    if(this.iInit_value>899) this.iInit_value=899;
    this.iInit_control = parseInt(sInit) + 100;
    if(this.iInit_control>999) this.iInit_control=999;
    this.UpdateControlInit();
  };
  // metodos de ordenación
  static sortByInit(fA, fB) {
    if(fA.iControlInit > fB.iControlInit) return -1;
    return 1;
  }
  static sortByName(fA, fB) {
    if (fA.sName < fB.sName) return -1;
    if (fA.sName === fB.sName) {
      if (fA.iNumRep < fB.iNumRep) return -1;
      else return 1;
    }
    return 1;
  }
  // control de escudos
  shieldsSaturation (iDeal) {
    const newState = new state( 20, 
      standardStates[20].name, 
      standardStates[20].desc, 
      standardStates[20].inca, 
      2, 
      this.sFullName(),
      AppData.combats[AppData.selected].TurnControl.fighterPos,
      AppData.combats[AppData.selected].TurnControl.fighterName);
    this.states.push(newState);
    /* Marea al combatiente si el daño que rompe
       los escudos es superior a la mitad de sus
       puntos totales
    */
    if (iDeal >= this.iSH/2) {
      const newState = new state( 16, 
        standardStates[16].name, 
        standardStates[16].desc, 
        standardStates[16].inca, 
        1, 
        this.sFullName(),
        AppData.combats[AppData.selected].TurnControl.fighterPos,
        AppData.combats[AppData.selected].TurnControl.fighterName);
      this.states.push(newState);
    }
  }
  shieldsSaturated () {
    for (let s of this.states) {
      if(s.iIcon === 20) return true;
    }
    return false;
  }
  shieldsForceSaturation () {
    if (this.shieldsSaturated()) {
      for (let s of this.states) {
        if(s.iIcon === 20) s.iTurnos = 2;
      }
    }
  }
  shieldsActivation(){
    this.iShld = this.iSH;
  }
  // elemento HTML para COMBATIENTES 
  showInFighters(parent) {
    /*
        <div class="fighter">
          <div class="fighter-name">Bandido 1</div>
          <div class="fighter-init">17</div>
          <div class="fighter-adds">+</div>
        </div> 
     */
    const divF = document.createElement("div");
    divF.classList.add(`fighter`);
    const divN = document.createElement("div");
    divN.classList.add(`fighter-name`);
    divN.innerHTML = this.sFullName();
    const divI = document.createElement("div");
    divI.classList.add(`fighter-init`);
    divI.innerHTML = this.sInitiative();
    const divA = document.createElement("div");
    divA.classList.add(`fighter-adds`);
    divA.innerHTML = "+";
    divA.addEventListener("click", ()=>{
      formEditFighter(this);
    })
    divF.appendChild(divN);
    divF.appendChild(divI);
    divF.appendChild(divA);
    parent.appendChild(divF);
  }
  // elemento HTML para TURNO DE INICIATIVA...
  showInInitiative(parent) {
    /*
      <div class="init-fighter init-active">
        <div class="init-value">22</div>
        <div class="init-name">Personaje 1</div>
      </div>
    */
    const divF = document.createElement("div");
    divF.classList.add(`init-fighter`);
    if (AppData.combats[AppData.selected].TurnControl.fighterName === this.sFullName()) {
      divF.classList.add("init-active");
      if(htmlStatsData!==null) {
        this.states.forEach(stateIn => {
          htmlStatsData.appendChild(stateIn.showStateInInit());
        })
      }
    }
    if (this.iLife <= 0) {
      divF.classList.add("init-dead");
    }
    divF.addEventListener("click", () => {
      formEditFighter(this);
    })
    const divI = document.createElement("div");
    divI.classList.add(`init-value`);
    divI.innerHTML = this.sInitiative();
    const divN = document.createElement("div");
    divN.classList.add(`init-name`);
    divN.innerHTML = this.sFullName();

    divF.appendChild(divI);
    divF.appendChild(divN);
    this.states.forEach(s => {
      divF.appendChild(s.divIcon());
    })
    parent.appendChild(divF);
  }
  // elemento HTML para CONTROL DE DAÑOS
  showInLife(parent) {
    if(this.bPje) return;
    const divF = document.createElement("div");
    divF.classList.add(`life-fighter`);  

    const divN = document.createElement("div");
    divN.classList.add(`life-name`);
    divN.innerHTML = this.sFullName();
    divN.addEventListener("click", () => {
      formEditFighter(this);
    })

    /* Shields */
    const divBS = document.createElement("div"); 
    divBS.classList.add("mark-blinded");
    if(this.iBS>0) divBS.classList.add("blinded");
    const divSF = document.createElement("div"); 
    divSF.classList.add(`shld-tupla`);
    if(this.shieldsSaturated()) this.iShld = 0;
    if(!this.iShld || this.iShld === 0) divSF.classList.add(`shld-inactive`);
    const divSh = document.createElement("div");
    divSh.classList.add(`shld-value`);
    divSh.innerHTML = `${this.iShld}`;
    const divTS = document.createElement("div");
    divTS.classList.add(`shld-total`);
    divTS.innerHTML = `${this.iSH}`;
    if (this.iShld / this.iSH > 0.85) divSF.classList.add("shld-90");
    else if (this.iShld / this.iSH > 0.55) divSF.classList.add("shld-70");
    else if (this.iShld / this.iSH > 0.35) divSF.classList.add("shld-45");
    else if (this.iShld / this.iSH > 0.1) divSF.classList.add("shld-25");
    else if (this.iShld / this.iSH > 0) divSF.classList.add("shld-5");
    else divSF.classList.add("shld-0");
    divSF.appendChild(divSh);
    divSF.appendChild(divTS);
    divSF.addEventListener("click", ()=>{
      formShieldFighter(this);
    })
    divBS.appendChild(divSF);
    
    /* Life */
    const divBL = document.createElement("div"); 
    divBL.classList.add("mark-blinded");
    if(this.iBL>0) divBL.classList.add("blinded");
    const divLF = document.createElement("div"); 
    divLF.classList.add(`life-tupla`);
    const divL = document.createElement("div");
    divL.classList.add(`life-value`);
    divL.innerHTML = `${this.iLife}`;
    const divT = document.createElement("div");
    divT.classList.add(`life-total`);
    divT.innerHTML = `${this.iPG}`;
    if (this.iLife > this.iPG) divLF.classList.add("life-100");
    else if (this.iLife / this.iPG > 0.85) divLF.classList.add("life-90");
    else if (this.iLife / this.iPG > 0.55) divLF.classList.add("life-70");
    else if (this.iLife / this.iPG > 0.35) divLF.classList.add("life-45");
    else if (this.iLife / this.iPG > 0.1) divLF.classList.add("life-25");
    else if (this.iLife / this.iPG > 0) divLF.classList.add("life-5");
    else divLF.classList.add("life-0");
    divLF.appendChild(divL);
    divLF.appendChild(divT);
    divLF.addEventListener("click", ()=>{
      formHealedFighter(this);
    })
    divBL.appendChild(divLF);
    
    divF.appendChild(divN);
    divF.appendChild(divBS);
    divF.appendChild(divBL);
    parent.appendChild(divF);   
  }
  checkStates(){
    let bInc = false;
    this.states.forEach((s) => {
      bInc = s.bInca || bInc;
    })
    return bInc;
  }
  startTurn(){
    // Aumenta la cantidad de escudos si los escudos están activos
    if (!this.shieldsSaturated() && this.iShld > 0) {
      this.iShld += this.iRS;
      this.iShld = Math.min(this.iShld, this.iSH);
    }
  }
  cleanStates(){
    this.states = this.states.filter(s => s.iTurnos>0)
  }

};

/******** Gestión de combatientes ****************/
function getFighterByInit(iInitValue) {
  let fighterName = "";
  AppData.combats[AppData.selected].FightersList.forEach(element => {
    if(element.iControlInit === iInitValue && 
       element.iLife > 0 // No selecciona si no está vivo
                         // No selecciona si tiene algún estado alterado que no lo deja actuar
       ) {
      fighterName = element.sFullName();
    }
  });
  return fighterName;
};
function getFighterByName(sTestName) {
  let oFighter;
  AppData.combats[AppData.selected].FightersList.forEach(element => {
    if(element.sFullName() === sTestName) {
      oFighter = element;
    }
  });
  return oFighter;
};
function getLastFighterByName(sTestName) {
  let fighterNum = 0;
  AppData.combats[AppData.selected].FightersList.forEach(element => {
    if(element.sName === sTestName) {
      fighterNum = (element.iNumRep>fighterNum ? element.iNumRep : fighterNum);
    }
  });
  fighterNum++;
  return fighterNum;
};
function existsFighterByName(sTestName) {
  let retvalue = false;
  AppData.combats[AppData.selected].FightersList.forEach(element => {
    if(element.bPje && element.sName === sTestName) {
      retvalue = true;
    }
  });
  return retvalue;
};
function posInitFighterByName(sTestName) {
  for(let i=0; i<AppData.combats[AppData.selected].InitiativeList.length;i++) {
    if (AppData.combats[AppData.selected].InitiativeList[i].sFullName()===sTestName) {
      return i;
    }
  }
  return -1;
};
function posCombFighterByName(sTestName) {
  for(let i=0; i<AppData.combats[AppData.selected].FightersList.length;i++) {
    if (AppData.combats[AppData.selected].FightersList[i].sFullName()===sTestName) {
      return i;
    }
  }
  return -1;
};
function posLifeFighterByName(sTestName) {
  for(let i=0; i<AppData.combats[AppData.selected].LifeList.length;i++) {
    if (AppData.combats[AppData.selected].LifeList[i].sFullName()===sTestName) {
      return i;
    }
  }
  return -1;
};
function addFighter(bJugador, sNombre, sBonoInic, sIniciativa, bTiradaAuto, sPG, sSH, sRS, bBlindedLife, bBlindedShields){
  if(sNombre === "") return;
  if (sPG === "") sPG = "0";
  if (sSH === "") sSH = "0";
  if (sRS === "") sRS = "0";
  let iPG = parseInt(sPG);
  let iSH = parseInt(sSH);
  let iRS = parseInt(sRS);
  if(bJugador) {
    iPG = 1; iSH = 1; iRS = 1;
  }
  if (existsFighterByName(sNombre)) return;
  const newFighter = new fighter(sNombre, 
                                 sBonoInic, 
                                 sIniciativa, 
                                 bJugador, 
                                 getLastFighterByName(sNombre), 
                                 iPG,
                                 iSH,
                                 iRS,
                                 bBlindedLife,
                                 bBlindedShields);
  if (bTiradaAuto) newFighter.setInit(Math.floor(Math.random()*20)+1+newFighter.iInit_bon);
  AppData.combats[AppData.selected].FightersList.push(newFighter);
  AppData.combats[AppData.selected].InitiativeList.push(newFighter);
  AppData.combats[AppData.selected].InitiativeList.sort(fighter.sortByInit);
  AppData.combats[AppData.selected].LifeList.push(newFighter);
  AppData.combats[AppData.selected].LifeList.sort(fighter.sortByName);
  updateTurn();
};
function HaveChangedListOrderByName (List1, List2) {
  let i;
  for (i=0; i<List1.length; i++) {
    if(List1[i].sFullName() !== List2[i].sFullName()) {
      return true;
    }
  }
  return false;
}
function editFighter(oFighter, sBonoInic, sIniciativa, iBlindedLife, iBlindedShields){
  const oldInitiative = [...AppData.combats[AppData.selected].InitiativeList];
  const oldInit = oFighter.iControlInit;
  oFighter.setBono(sBonoInic);
  oFighter.setInit(sIniciativa);
  oFighter.iBL = iBlindedLife;
  oFighter.iBS = iBlindedShields;
  AppData.combats[AppData.selected].InitiativeList.sort(fighter.sortByInit);
  if (oFighter.sFullName() === AppData.combats[AppData.selected].TurnControl.fighterName) {
    if (HaveChangedListOrderByName(oldInitiative, AppData.combats[AppData.selected].InitiativeList)) {
      if(oldInit > oFighter.iControlInit) AppData.combats[AppData.selected].TurnControl.fighterName = "";
      nextFighter();
    } else {
      AppData.combats[AppData.selected].TurnControl.fighterPos = oFighter.iControlInit;
      updateTurn();
    }
  } else {
    updateTurn();
  }
};
function deleteFighter(oFighter){
  AppData.combats[AppData.selected].InitiativeList.splice(posInitFighterByName(oFighter.sFullName()),1);
  AppData.combats[AppData.selected].FightersList.splice(posCombFighterByName(oFighter.sFullName()),1);
  AppData.combats[AppData.selected].LifeList.splice(posLifeFighterByName(oFighter.sFullName()),1);
  if(AppData.combats[AppData.selected].TurnControl.fighterName === oFighter.sFullName()) nextFighter();
  else updateTurn();
};
function modShldFighter(oFighter, sDano, cbMasivo){
  if (sDano==="") sDano="0";
  const iDano = parseInt(sDano);
  //Quitamos escudos
  oFighter.iShld += iDano;
  if (oFighter.iShld <= 0) { 
    if(cbMasivo) {
      oFighter.iLife += oFighter.iShld;
    }
    oFighter.iShld = Math.max(0, oFighter.iShld); 
    oFighter.shieldsSaturation(0);
  }
  else oFighter.iShld = Math.min(oFighter.iSH, oFighter.iShld); 
  updateTurn();
};
function modLifeFighter(oFighter, sDano){
  if (sDano==="") sDano="0";
  if (sDano!=="0") oFighter.shieldsForceSaturation();
  oFighter.iLife += parseInt(sDano);  
  updateTurn();
};

/******* Actualizar listas ****************/
function showFighters(){
  const HTMLFightersList = document.getElementById("fighters-list");
  HTMLFightersList.innerHTML = "";
  if(fighterPanelClosed) {
    HTMLFightersList.parentElement.classList.add("panel-cerrado");
    return;
  } else {
    HTMLFightersList.parentElement.classList.remove("panel-cerrado");
  }
  AppData.combats[AppData.selected].FightersList.forEach(oFighter => { 
    oFighter.showInFighters(HTMLFightersList); 
  });
};
function showInitiative(){
  const HTMLInitiativeList = document.getElementById("initiative-list");
  HTMLInitiativeList.innerHTML = "";
  if(htmlStatsData!==null) htmlStatsData.innerHTML = "";
  const hF = 32;
  let heightInitPanel = 0;
  if(window.innerWidth >= WidthResponsive) {
    heightInitPanel = Math.min(AppData.combats[AppData.selected].InitiativeList.length * hF, 200);
    if(AppData.combats[AppData.selected].InitiativeList.length > 12) {
      heightInitPanel = Math.ceil(AppData.combats[AppData.selected].InitiativeList.length/2) * hF;
    } 
  }
  else heightInitPanel = AppData.combats[AppData.selected].InitiativeList.length * hF;
  HTMLInitiativeList.style.height = `${heightInitPanel}px`;
  
  AppData.combats[AppData.selected].InitiativeList.forEach(oFighter => { oFighter.showInInitiative(HTMLInitiativeList) });
};
function showLife(){
  const HTMLLifeList = document.getElementById("life-list");
  HTMLLifeList.innerHTML = "";
  AppData.combats[AppData.selected].LifeList.forEach(oFighter => { oFighter.showInLife(HTMLLifeList) });
};
function showCombats(){
  htmlInpNomCo.value = AppData.combats[AppData.selected].TurnControl.nombre
  const HTMLCombatList = document.getElementById("combat-list");
  HTMLCombatList.innerHTML = "";
  AppData.combats.forEach((combat, index) => {
    const divFila = document.createElement("div");
    divFila.classList.add("combat-fila");
    if(index===AppData.selected) divFila.classList.add("combat-selected");
    const pTitle = document.createElement("p");
    pTitle.innerHTML = combat.TurnControl.nombre;
    pTitle.addEventListener("click", ()=>{
      selectCombat(index);
    })
    const btnEliminar = document.createElement("button")
    btnEliminar.classList.add("btn")
    btnEliminar.innerHTML = "ELIMINAR"
    btnEliminar.addEventListener("click", ()=>{
      deleteCombat(index);
    })
    divFila.appendChild(pTitle);
    divFila.appendChild(btnEliminar);
    HTMLCombatList.appendChild(divFila);
  });
};
function checkwindowWidthChange(){
  if (lastwindowwidth+5>WidthResponsive && window.innerWidth<WidthResponsive ||
    lastwindowwidth-5<WidthResponsive && window.innerWidth>WidthResponsive) {
      lastwindowwidth = window.innerWidth;
      showInitiative();
    }
}
function getPositionStatebyName (name) {
  for (let i = 0; i < standardStates.length; i++) {
    const state = standardStates[i];
    if(state.name === name) return i;
  }
  return 0;
}
/******* Elementos de ayuda para FORMULARIOS **********/
function formPrep(){
  const divOpac = document.createElement("div");
  divOpac.classList.add("form-exterior");
  const divForm = document.createElement("div");
  divForm.classList.add("form-dialogo");
  divOpac.appendChild(divForm);
  return [divOpac, divForm];
};
function formTitle(Caption){
  const divT = document.createElement("div");
  divT.classList.add("form-div-titulo");
  const pTit = document.createElement("p");
  pTit.classList.add("form-titulo");
  pTit.innerHTML = Caption;  
  const divC = document.createElement("div");
  divC.classList.add("form-cerrar");
  divT.appendChild(pTit);
  divT.appendChild(divC);
  return [divT, pTit, divC];
}
function formSeccion(Caption){
  const divT = document.createElement("div");
  divT.classList.add("form-div-titulo");
  const pTit = document.createElement("p");
  pTit.classList.add("form-seccion");
  pTit.innerHTML = Caption;  
  const divC = document.createElement("div");
  divC.classList.add("form-cerrar");
  divT.appendChild(pTit);
  divT.appendChild(divC);
  return [divT, pTit, divC];
}
function formText(Details){
  const pDet = document.createElement("p");
  pDet.classList.add("form-details-text");
  pDet.innerHTML = Details;  
  return pDet;
}
function formTextInput(Caption, ID, bOnlyNumbers = false){
  const div = document.createElement("div");
  div.classList.add("form-line-group");
  const pText = document.createElement("p");
  pText.classList.add("form-textinput-text");
  pText.innerHTML = Caption;
  const iText = document.createElement("input");
  iText.classList.add("form-textinput-input");
  iText.setAttribute("id",ID);
  if(bOnlyNumbers) iText.setAttribute("type","number");
  div.appendChild(pText);
  div.appendChild(iText);
  return [div,pText,iText];
};
function formTextInfoBlindaje(Caption, Text){
  const div = document.createElement("div");
  div.classList.add("form-line-group");
  const pText = document.createElement("p");
  pText.classList.add("form-textinput-text");
  pText.innerHTML = Caption;
  const iText = document.createElement("div");
  iText.classList.add("form-textinput-input");
  iText.innerHTML = Text;
  div.appendChild(pText);
  div.appendChild(iText);
  return [div,pText,iText];
};
function formMemoInput(Caption, ID){
  const div = document.createElement("div");
  div.classList.add("form-memo-group");
  const pText = document.createElement("p");
  pText.classList.add("form-textinput-text");
  pText.innerHTML = Caption;
  const iText = document.createElement("textarea");
  iText.classList.add("form-textinput-memo");
  iText.setAttribute("id",ID);
  iText.setAttribute("oninput","autogrow(this)");
  div.appendChild(pText);
  div.appendChild(iText);
  return [div,pText,iText];
};
function formCheckBox(Caption, ID) {
  const divC = document.createElement("div");
  divC.classList.add("form-line-group");
  const iChbx = document.createElement("input");
  iChbx.classList.add("form-input-checkbox");
  iChbx.setAttribute("type","checkbox");
  iChbx.setAttribute("id",ID);
  const lbChbx = document.createElement("label");
  lbChbx.setAttribute("for",ID);
  lbChbx.classList.add("form-label-checkbox");
  lbChbx.innerHTML = Caption;
  divC.appendChild(lbChbx);  
  divC.appendChild(iChbx);
  return [divC, iChbx, lbChbx];
}
function changeCheckBox(checkBox, checkBoxSec, valideElements, invalideElements){
  valideElements.forEach(element => {
    element.disabled = !checkBox.checked;
  });
  invalideElements.forEach(element => {
    element.disabled = checkBox.checked;
  });
  if (checkBoxSec!=undefined) checkBoxSec.checked = !checkBox.checked;
};
function formButtons(numButtons, Captions, OnCliks){
  const buttons = new Array();
  const divB = document.createElement("div");
  divB.classList.add("form-button-group");
  for(let i=0; i<numButtons;i++){
    const bAdd = document.createElement("button");
    bAdd.classList.add("btn","form-button");
    bAdd.innerHTML = Captions[i];
    bAdd.addEventListener("click", OnCliks[i]);
    divB.appendChild(bAdd);
    buttons.push(bAdd);
  }
  return [divB, buttons];
}
function formSelect (ID, Elements){
  const select = document.createElement("select");
  select.classList.add("form-select");
  select.setAttribute("id",ID);
  select.setAttribute("size","8");

  const SortedElements = [...Elements];
  SortedElements.sort((fA, fB) => {
    if(fA.name < fB.name) return -1;
    return 1;
  })
  
  for(let i=0;i<SortedElements.length;i++){
    const opt = document.createElement("option");
    opt.setAttribute("value", SortedElements[i].name);
    opt.innerHTML = SortedElements[i].name;
    select.appendChild(opt);
  }
  return select;
}
function formSelectFighter (ID, Elements){
  const div = document.createElement("div");
  div.classList.add("form-select-div");
  const select = document.createElement("select");
  select.classList.add("form-select");
  select.setAttribute("id",ID);
  
  for(let i=0;i<Elements.length;i++){
    const opt = document.createElement("option");
    opt.setAttribute("value", Elements[i].sFullName());
    opt.innerHTML = Elements[i].sFullName();
    select.appendChild(opt);
  }

  div.appendChild(select);
  return [div, select];
}
function autogrow(element) {
  element.style.height = "5px";
  element.style.height = (element.scrollHeight) + "px";
}
/******* FORMULARIOS ******************/
function formNewFighter(){
  const divOpac = formPrep();

  // VISUAL
  const pTit = formTitle("Nuevo combatiente");
  pTit[2].addEventListener("click", ()=>{ divOpac[0].remove(); });
  const iName = formTextInput("Nombre","id-nombre-combatiente");
  const iSIni = formSeccion("Iniciativa");
  iSIni[2].style.height = "0px";
  const iBono = formTextInput("Bonificador","id-bono-iniciativa",true);
  const iInit = formTextInput("Tirada","id-tira-iniciativa",true);
  const iSBli = formSeccion("Blindaje");
  iSBli[2].style.height = "0px";
  const cBlLf = formTextInput("Vida","id-blinded-life",true);
  const cBlSh = formTextInput("Escudos","id-blindel-shields",true);
  const iSVid = formSeccion("Vida y escudos");
  iSVid[2].style.height = "0px";
  const iPtGP = formTextInput("Vida (PG)","id-puntos-golpe",true);
  const iPtSH = formTextInput("Escudos (SH)","id-puntos-escudos",true);
  const iPtRS = formTextInput("Recuperación (RS)","id-recupera-escudos",true);
  const pExpR = formText("{Recuperación (RS)} Determina la cantidad de escudos que recuperará por turno")
  const iChbxJ = formCheckBox("Jugador", "chbxJugador");
  const iChbxT = formCheckBox("Tirada automatica", "chbxTiradaAuto");
  const divB = formButtons(1, ["AÑADIR"], [
    () => { addFighter(iChbxJ[1].checked, 
                       iName[2].value, 
                       iBono[2].value, 
                       iInit[2].value, 
                       iChbxT[1].checked, 
                       iPtGP[2].value,
                       iPtSH[2].value,
                       iPtRS[2].value,
                       cBlLf[2].value,
                       cBlSh[2].value );}
  ]);
  divB[0].style.borderTop = ".2rem solid var(--colorPri)";
  divB[0].style.paddingTop = ".3rem";
  divB[0].style.marginTop = ".5rem"; 
  // LOGICA
  iInit[2].disabled = true;
  iChbxT[1].checked = true;
  iChbxJ[1].addEventListener("click", ()=>{ changeCheckBox(iChbxJ[1], iChbxT[1], [iInit[2]], [iPtGP[2], iPtSH[2], iPtRS[2]])} );
  iChbxJ[2].addEventListener("click", ()=>{ changeCheckBox(iChbxJ[1], iChbxT[1], [iInit[2]], [iPtGP[2], iPtSH[2], iPtRS[2]])} );
  iChbxT[1].addEventListener("click", ()=>{ changeCheckBox(iChbxT[1], undefined, [], [iInit[2]])} );
  iChbxT[2].addEventListener("click", ()=>{ changeCheckBox(iChbxT[1], undefined, [], [iInit[2]])} );
  
  // MONTAJE
  divOpac[1].appendChild(pTit[0]);
  divOpac[1].appendChild(iChbxJ[0]);
  divOpac[1].appendChild(iName[0]);
  divOpac[1].appendChild(iSIni[0]);
  divOpac[1].appendChild(iBono[0]);
  divOpac[1].appendChild(iInit[0]);
  divOpac[1].appendChild(iSBli[0]);
  divOpac[1].appendChild(cBlLf[0]);
  divOpac[1].appendChild(cBlSh[0]);
  divOpac[1].appendChild(iSVid[0]);
  divOpac[1].appendChild(iPtGP[0]);
  divOpac[1].appendChild(iPtSH[0]);
  divOpac[1].appendChild(iPtRS[0]);
  divOpac[1].appendChild(pExpR);
  divOpac[1].appendChild(iChbxT[0]);
  divOpac[1].appendChild(divB[0]);
  HTMLMain.appendChild(divOpac[0]);
};
function formEditFighter(oFighter){
  const divOpac = formPrep();
  // VISUAL
  const pTit = formTitle(oFighter.sFullName());
  pTit[2].addEventListener("click", ()=>{ divOpac[0].remove(); updateTurn(); });
  const pTIt = formSeccion(`Iniciativa`);
  pTIt[2].style.height = "0px";
  const iBono = formTextInput("Bonificador","id-bono-iniciativa",true);
  const iInit = formTextInput("Tirada","id-tira-iniciativa",true);

  const sBli = formSeccion(`Blindaje`);
  sBli[2].style.height = "0px";
  const cBlLf = formTextInput("Vida","id-blinded-life",true);
  const cBlSh = formTextInput("Escudos","id-blindel-shields",true);

  const pTSd = formSeccion(`Escudos`);
  pTSd[2].style.height = "0px";
  const divS = formButtons(2, ["REACTIVAR", "DESACTIVAR"], [
    ()=>{ 
      if(!oFighter.shieldsSaturated() && oFighter.iShld===0 ) {
        divOpac[0].remove();
        oFighter.shieldsActivation(); 
        updateTurn();
      }
    },
    ()=>{ 
      if(!oFighter.shieldsSaturated() && oFighter.iShld > 0) {
        divOpac[0].remove();
        oFighter.shieldsSaturation(0); 
        updateTurn();
      }
    }]
    );
  divS[0].style.justifyContent = "space-evenly";
    
  const pTEt = formSeccion(`Estados alterados`);
  pTEt[2].style.height = "0px";
  const divE = formButtons(1, ["AÑADIR"], [
    ()=>{ divOpac[0].remove(); formAddState(oFighter); updateTurn(); }
  ]);
  divE[0].style.justifyContent = "center";
  const pTEc = formSeccion(`Borrado`);
  pTEc[2].style.height = "0px";
  const divD = formButtons(1, ["ELIMINAR COMBATIENTE"], [
    ()=>{ divOpac[0].remove(); deleteFighter(oFighter, iBono[2].value, iInit[2].value); }
  ]);
  divD[0].style.justifyContent = "center";
  const divB = formButtons(1, ["ACEPTAR"], [
    ()=>{ divOpac[0].remove(); editFighter(oFighter, iBono[2].value, iInit[2].value, cBlLf[2].value, cBlSh[2].value); }
  ]);
  divB[0].style.borderTop = ".2rem solid var(--colorPri)";
  divB[0].style.paddingTop = ".3rem";
  divB[0].style.marginTop = ".5rem";

  
  // LOGICA
  iBono[2].value = `${oFighter.iInit_bon}`;
  iInit[2].value = `${oFighter.iInit_value}`;
  cBlLf[2].value = oFighter.iBL;
  cBlSh[2].value = oFighter.iBS;

  //MONTAJE
  divOpac[1].appendChild(pTit[0]);
  divOpac[1].appendChild(pTIt[0]);
  divOpac[1].appendChild(iBono[0]);
  divOpac[1].appendChild(iInit[0]);
  divOpac[1].appendChild(formText("Los cambios que realices en los datos de iniciativa afectarán inmediatamente al orden de turno<hr>"));
  divOpac[1].appendChild(sBli[0]);
  divOpac[1].appendChild(cBlLf[0]);
  divOpac[1].appendChild(cBlSh[0]);
  divOpac[1].appendChild(pTSd[0]);
  divOpac[1].appendChild(divS[0]);
  divOpac[1].appendChild(formText("Esta sección permite reactivar y desactivar los escudos a voluntad. Aunque no podrán reactivarse si el combatiente tiene el estado<br>[Protecciones saturadas]<hr>"));
  divOpac[1].appendChild(pTEt[0]);
  oFighter.states.forEach(stateIn => {
    divOpac[1].appendChild(stateIn.showStateInEdit(divOpac[0]));
  })
  divOpac[1].appendChild(divE[0]);
  divOpac[1].appendChild(formText("Aqui puedes añadir estados alterados al combatiente<hr>"));
  divOpac[1].appendChild(pTEc[0]);
  divOpac[1].appendChild(divD[0]);
  divOpac[1].appendChild(divB[0]);
  HTMLMain.appendChild(divOpac[0]);
};
function formShieldFighter(oFighter){
  const divOpac = formPrep();
  // VISUAL
  const pTit = formTitle(`Escudos de ${oFighter.sFullName()}`);
  pTit[2].addEventListener("click", ()=>{ divOpac[0].remove(); });
  const iBlin = formTextInfoBlindaje("Blindado",oFighter.iBS);
  iBlin[2].style.backgroundColor = "var(--colorBlinded)"
  const iDano = formTextInput("Modificar (+/-)","id-dano",true);

  const pExp1 = document.createElement("p");
  pExp1.classList.add("form-details-text");
  pExp1.innerHTML = "Un valor positivo aumentará los escudos esa cantidad";
  const pExp2 = document.createElement("p");
  pExp2.classList.add("form-details-text");
  pExp2.innerHTML = "Un valor negativo reducirá los escudos esa cantidad<hr>";

  const cbMass = formCheckBox("Sobrepasa escudos","id-dano-masivo");
  
  const divB = formButtons(1, ["ACEPTAR"], [
    ()=>{ divOpac[0].remove(); modShldFighter(oFighter, iDano[2].value, cbMass[1].checked); }
  ]);  
  divB[0].style.borderTop = ".2rem solid var(--colorPri)";
  divB[0].style.paddingTop = ".3rem";
  divB[0].style.marginTop = ".5rem";

  //MONTAJE
  divOpac[1].appendChild(pTit[0]);
  if(oFighter.iBS>0) divOpac[1].appendChild(iBlin[0]);
  divOpac[1].appendChild(iDano[0]);
  divOpac[1].appendChild(pExp1);
  divOpac[1].appendChild(pExp2);
  divOpac[1].appendChild(cbMass[0]);
  divOpac[1].appendChild(formText("Activa esta casilla si los escudos han sufrido un daño que afectará también a la vida (Daño MASIVO, CRITICO y COMBINACION DE PODERES."));
  divOpac[1].appendChild(divB[0]);
  HTMLMain.appendChild(divOpac[0]);
};
function formHealedFighter(oFighter){
  const divOpac = formPrep();
  // VISUAL
  const pTit = formTitle(`Vida de ${oFighter.sFullName()}`);
  pTit[2].addEventListener("click", ()=>{ divOpac[0].remove(); });
  const iDano = formTextInput("Modificar (+/-)","id-dano",true);
  const iBlin = formTextInfoBlindaje("Blindado",oFighter.iBL);
  iBlin[2].style.backgroundColor = "var(--colorBlinded)"  

  const pExp1 = document.createElement("p");
  pExp1.classList.add("form-details-text");
  pExp1.innerHTML = "Un valor positivo aumentará la vida esa cantidad";
  const pExp2 = document.createElement("p");
  pExp2.classList.add("form-details-text");
  pExp2.innerHTML = "Un valor negativo reducirá la vida esa cantidad";

  const divB = formButtons(1, ["ACEPTAR"], [
    ()=>{ divOpac[0].remove(); modLifeFighter(oFighter, iDano[2].value); }
  ]);  
  divB[0].style.borderTop = ".2rem solid var(--colorPri)";
  divB[0].style.paddingTop = ".3rem";
  divB[0].style.marginTop = ".5rem";

  //MONTAJE
  divOpac[1].appendChild(pTit[0]);
  if(oFighter.iBL>0) divOpac[1].appendChild(iBlin[0]);
  divOpac[1].appendChild(iDano[0]);
  divOpac[1].appendChild(pExp1);
  divOpac[1].appendChild(pExp2);
  divOpac[1].appendChild(divB[0]);
  HTMLMain.appendChild(divOpac[0]);
};
function formAddState(oFighter, type){
  const divOpac = formPrep();
  if(type===undefined) type = 0;
  const pTit = formSeccion(`Añadir estado alterado a ${oFighter.sFullName()}`);
  pTit[2].addEventListener("click", ()=>{ divOpac[0].remove(); formEditFighter(oFighter); });

  const divT = formButtons(1,["SELECCIONAR ESTANDAR"], [()=>{
    divOpac[0].remove(); formSelectStateType(oFighter, null, true);
  }])
  const iName = formTextInput("Nombre","id-state-name",false);
  const iDesc = formMemoInput("Descripción","id-state-desc");
  const iChbx = formCheckBox("Incapacitante","id-state-donothing");
  const iNTrn = formTextInput("Turnos","id-state-truns",true);

  const pFCa = formSeccion(`Causante`);
  pFCa[2].style.height = "0px";
  const sCau = formSelectFighter("id-select-fighter",AppData.combats[AppData.selected].FightersList);
  if (AppData.combats[AppData.selected].TurnControl.fighterName!="") sCau[1].value = AppData.combats[AppData.selected].TurnControl.fighterName;

  const divB = formButtons(1, ["ACEPTAR"], [
    ()=>{
      divOpac[0].remove();
      const oFighterCau = getFighterByName(sCau[1].value);
      const iInitCau = oFighterCau.iControlInit;
      const newState = new state( type, 
                                  iName[2].value, 
                                  iDesc[2].value, 
                                  iChbx[1].checked, 
                                  (type===27?parseInt(iNTrn[2].value)+1:iNTrn[2].value), 
                                  oFighter.sFullName(),
                                  iInitCau,
                                  oFighterCau.sFullName());
      oFighter.states.push(newState);
      formEditFighter(oFighter);
    }
  ])
  divB[0].style.borderTop = ".2rem solid var(--colorPri)";
  divB[0].style.paddingTop = ".3rem";
  divB[0].style.marginTop = ".5rem";

  if(type!==0) {
    iName[2].disabled = true;
    iDesc[2].disabled = true;
    iChbx[1].disabled = true;
    iName[2].value = standardStates[type].name;
    iDesc[2].value = standardStates[type].desc;
    iChbx[1].checked = standardStates[type].inca;
  }

  divOpac[1].appendChild(pTit[0]);
  divOpac[1].appendChild(divT[0]);
  divOpac[1].appendChild(iName[0]);
  divOpac[1].appendChild(iDesc[0]);
  divOpac[1].appendChild(iNTrn[0]);
  divOpac[1].appendChild(iChbx[0]);
  divOpac[1].appendChild(pFCa[0]);
  divOpac[1].appendChild(sCau[0]);
  divOpac[1].appendChild(divB[0]);
  HTMLMain.appendChild(divOpac[0]);
  autogrow(iDesc[2]);
};
function formEditState(oFighter, oState, type, fighterCau){
  const divOpac = formPrep();
  
  const pTit = formSeccion(`Editar estado alterado a ${oFighter.sFullName()}`);
  pTit[2].addEventListener("click", ()=>{ divOpac[0].remove(); formEditFighter(oFighter);});
  const divT = formButtons(1,["SELECCIONAR ESTANDAR"], [()=>{
    divOpac[0].remove(); formSelectStateType(oFighter, oState, false);
  }])
  const iName = formTextInput("Nombre","id-state-name",false);
  const iDesc = formMemoInput("Descripción","id-state-desc");
  const iChbx = formCheckBox("Incapacitante","id-state-donothing");
  const iNTrn = formTextInput("Turnos","id-state-truns",true);

  const pFCa = formSeccion(`Causante`);
  pFCa[2].style.height = "0px";
  const sCau = formSelectFighter("id-select-fighter",AppData.combats[AppData.selected].FightersList);
  if (fighterCau!="") sCau[1].value = fighterCau;
  
  const divB = formButtons(1, ["ACEPTAR"], [
    ()=>{
      divOpac[0].remove();
      oState.iIcon   = type;
      oState.sName   = iName[2].value;
      oState.sDesc   = iDesc[2].value;
      oState.bInca   = iChbx[1].checked;
      oState.iTurnos = parseInt(iNTrn[2].value);
      oState.iInit   = getFighterByName(sCau[1].value).iControlInit;
      oState.fighterDone = sCau[1].value;
      formEditFighter(oFighter);
    }
  ])
  divB[0].style.borderTop = ".2rem solid var(--colorPri)";
  divB[0].style.paddingTop = ".3rem";
  divB[0].style.marginTop = ".5rem";

  iName[2].value = oState.sName;
  iDesc[2].value = oState.sDesc;
  iChbx[1].checked = oState.bInca;
  iNTrn[2].value = oState.iTurnos.toString();

  if(type!==0) {
    iName[2].disabled = true;
    iDesc[2].disabled = true;
    iChbx[1].disabled = true;
    iName[2].value = standardStates[type].name;
    iDesc[2].value = standardStates[type].desc;
    iChbx[1].checked = standardStates[type].inca;
  }  

  divOpac[1].appendChild(pTit[0]);
  divOpac[1].appendChild(divT[0]);
  divOpac[1].appendChild(iName[0]);
  divOpac[1].appendChild(iDesc[0]);
  divOpac[1].appendChild(iNTrn[0]);
  divOpac[1].appendChild(iChbx[0]);
  divOpac[1].appendChild(pFCa[0]);
  divOpac[1].appendChild(sCau[0]);  
  divOpac[1].appendChild(divB[0]);
  HTMLMain.appendChild(divOpac[0]);
  autogrow(iDesc[2]);
};
function formSelectStateType(oFighter, oState, bNew){
  const divOpac = formPrep();
  
  const pTit = formSeccion(`Seleccionar estado alterado estandar`);
  pTit[2].style.height = "0px";

  const sEst = formSelect("id-select-state",standardStates);

  const bSel = formButtons(1, ["Seleccionar"], [()=>{
    divOpac[0].remove();
    const type = getPositionStatebyName(sEst.options[sEst.selectedIndex].value);
    if (bNew) formAddState(oFighter, type);
    else formEditState(oFighter, oState, type);
  }])

  divOpac[1].appendChild(pTit[0]);
  divOpac[1].appendChild(sEst);
  divOpac[1].appendChild(bSel[0]);

  HTMLMain.appendChild(divOpac[0]);
}

// --- MAIN ENTRY ---------------------------------------------------

window.addEventListener("load", ()=>{
  HTMLMain = document.querySelector("main");
  
  htmlInpNomCo = document.querySelector("#nom-combat");
  htmlInpNomCo.addEventListener("change", changeCombatTitle);
  
  loadLocal();

  htmlNumTurno = document.querySelector("#num-turno");
  window.addEventListener("resize", checkwindowWidthChange);
  
  htmlBtnTurno = document.getElementById("btn-next-turn");
  htmlBtnTurno.addEventListener("click", ()=>{ nextFighter() });
  if (AppData.combats[AppData.selected].TurnControl.mode===1) htmlBtnTurno.innerHTML = "CONTINUAR"

  htmlStatsData = document.getElementById("stats-data");
  htmlLogoDado  = document.getElementById("id-logo-dado");

  const btnAddFighter = document.getElementById("btn-add-fighter");
  btnAddFighter.addEventListener("click", formNewFighter); 
  
  const btnNewCombat = document.getElementById("btn-new-combat");
  btnNewCombat.addEventListener("click", newCombat);  

  const btnClearCombat = document.getElementById("btn-clear-combat");
  btnClearCombat.addEventListener("click", clearCombat);  

  const btnRestartCombat = document.getElementById("btn-restart-combat");
  btnRestartCombat.addEventListener("click", restartCombat);
  
  updateTurn();
})
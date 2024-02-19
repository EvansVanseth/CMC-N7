/** Elemento HTML global */
let HTMLMain;
/** Listas de la aplicación */
let FightersList = new Array();
let InitiativeList = new Array();
let LifeList = new Array();
let LoadList = new Array();
/** Control de turnos */
let TurnControl = {
  turno: 0,
  fighterPos: 99999999,
  fighterName: "",
  mode: 0 //0:Preparando, 1:Iniciado
};
let htmlNumTurno = null;
let htmlBtnTurno = null;
let htmlStatsData = null;
let htmlLogoDado = null;
function newCombat(){
  if(InitiativeList.length === 0) return;
  if (!confirm(`Esta acción eliminará todos los combatientes y reiniciará el combate entero.
  
  ¿Quieres hacerlo igualmente?`)) return;
  FightersList.splice(0, FightersList.length);
  InitiativeList.splice(0, InitiativeList.length);
  LifeList.splice(0, LifeList.length);
  FightersList.length = 0;
  InitiativeList.length = 0;
  LifeList.length = 0;
  TurnControl.turno = 0;
  TurnControl.fighterPos = 999999999;
  TurnControl.fighterName = "";
  TurnControl.mode = 0;
  htmlBtnTurno.innerHTML = "INICIAR";
  showFighters();
  showLife();
  updateTurn();
  saveLocal();
};
function clearCombat(){
  if(TurnControl.mode === 0) return;
  if (!confirm(`Esta acción reiniciará el combate.
  
  ¿Quieres hacerlo igualmente?`)) return;
  TurnControl.turno = 0;
  if(InitiativeList.length>0) {
    TurnControl.fighterName = InitiativeList[0].sFullName();
    TurnControl.fighterPos = InitiativeList[0].iControlInit;
  } else 
  TurnControl.fighterName = "";
  TurnControl.fighterPos = 999999999;
  TurnControl.mode = 0;
  htmlBtnTurno.innerHTML = "INICIAR";
  showFighters();
  showLife();
  updateTurn();
  saveLocal();
};
function saveLocal(){
  localStorage.setItem("cmc-turn-cont", JSON.stringify(TurnControl));
  localStorage.setItem("cmc-figh-list", JSON.stringify(FightersList));
  localStorage.setItem("cmc-init-list", JSON.stringify(InitiativeList));
  localStorage.setItem("cmc-life-list", JSON.stringify(LifeList));
}
function loadLocal(){
  if(localStorage.getItem("cmc-turn-cont")!=null)
    TurnControl = JSON.parse(localStorage.getItem("cmc-turn-cont"));
  if(localStorage.getItem("cmc-figh-list")!=null)
    LoadList = JSON.parse(localStorage.getItem("cmc-figh-list"));
  LoadList.forEach(element => {
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
    newFighter.iDesEmpInit = element.iDesEmpInit;
    newFighter.iControlInit = element.iControlInit;
    element.states.forEach(eleState => {
      const newState = new state(eleState.iIcon,
                               eleState.sName,
                               eleState.sDesc,
                               eleState.bInca,
                               eleState.iTurnos,
                               newFighter.sFullName());
      newFighter.states.push(newState);
    });
    
    FightersList.push(newFighter);
    InitiativeList.push(newFighter);
    LifeList.push(newFighter);
  })
  InitiativeList.sort(fighter.sortByInit);
  LifeList.sort(fighter.sortByName);
  showFighters();
  showLife();
  showInitiative();
}
function updateTurn(){
  if(TurnControl.mode===0) {
    TurnControl.fighterName = "";
    TurnControl.fighterPos = 999999999;
    htmlNumTurno.innerHTML = "Prep.";
  } else {
    htmlNumTurno.innerHTML = `${TurnControl.turno}`;
  }
  showInitiative();
};
function findNextFighter(){
  const promise = new Promise((resolve, reject) => {
    let fighterFind = "";
    console.log(FightersList.length);
    if(FightersList.length>0) {
      if(TurnControl.fighterName !== "") {
        getFighterByName(TurnControl.fighterName).statesPassTurn();
      }
      htmlBtnTurno.innerHTML = "SIGUIENTE";
      if(TurnControl.mode===0) {
        TurnControl.mode = 1;
        TurnControl.fighterPos = InitiativeList[0].iControlInit;
        TurnControl.fighterName = InitiativeList[0].sFullName();
        if (InitiativeList[0].checkStates()) nextFighter();
      } else {
        do {
          if(TurnControl.fighterPos<80000000 || 
            TurnControl.fighterName === InitiativeList[InitiativeList.length-1].sFullName()) {
              TurnControl.fighterPos = InitiativeList[0].iControlInit + 1;
              TurnControl.fighterName = "";
              TurnControl.turno++;
            } else {
              TurnControl.fighterPos--;
              fighterFind = getFighterByInit(TurnControl.fighterPos);
            }
          } while (fighterFind==="");
          TurnControl.fighterName = fighterFind;
          if (getFighterByName(fighterFind).checkStates()) nextFighter();
      }
      updateTurn();
      saveLocal();
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
  showFighters();
};
/******** clase ESTADO Alterado **********/
const standardStates = [
  {
    icon: 0,
    name: '',
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
    desc: '+2 a las tiradas e ataque y ignora el bonificador de Destreza a la CA de los enemigos.',
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
]
class state {
  constructor( iIcon,
               sName,
               sDesc,
               bInca,
               iTurnos,
               fighterName) {
    this.iIcon = iIcon;
    this.sName = sName;
    this.sDesc = sDesc;
    this.bInca = bInca;
    this.iTurnos = iTurnos;
    this.fighterName = fighterName;
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
      formEditState(oFighter, this, this.iIcon);
    })
    const divD = document.createElement("div");
    divD.classList.add("state-delete");
    divD.addEventListener("click", ()=>{
      divOpac.remove();
      const oFighter = getFighterByName(this.fighterName);
      oFighter.states = oFighter.states.filter(e => e!==this);
      formEditFighter(oFighter);
    })
    const pDesc = document.createElement("p");
    pDesc.classList.add("state-desc");
    pDesc.innerHTML = `${this.sDesc}`;    
    
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
    pDesc.innerHTML = `${this.sDesc}`;    
    
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
               iPG
               ) {
    this.sName = sName;
    this.iInit_bon = 0;
    this.iInit_value = 0;
    this.iBono_control = 0;
    this.iInit_control = 0;
    this.bPje = bPje;
    this.iNumRep = iNumRep;
    this.iPG = iPG;
    this.iLife = iPG;
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
    if (TurnControl.fighterName === this.sFullName()) {
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
    /*
      <div class="life-fighter life-100">
        <div class="life-name">Bandido 1</div>
        <div class="life-value">12</div>
        <div class="life-total">15</div>
        <button class="life-btn" id="btn-life-up">+</button>
        <button class="life-btn" id="btn-life-dn">-</button>
      </div>
      .life-100 { color: black; background-color: var(--colorLife100);}
      .life-90 { color: white; background-color: var(--colorLife090);}
      .life-70 { color: white; background-color: var(--colorLife070);}
      .life-45 { color: white; background-color: var(--colorLife045);}
      .life-25 { color: white; background-color: var(--colorLife025);}
      .life-5 { color: white; background-color: var(--colorLife005);}
      .life-0 { color: white; background-color: var(--colorLife000);}      
    */
    if(this.bPje) return;
    const divF = document.createElement("div");
    divF.classList.add(`life-fighter`);
    if (this.iLife > this.iPG) divF.classList.add("life-100");
    else if (this.iLife / this.iPG > 0.85) divF.classList.add("life-90");
    else if (this.iLife / this.iPG > 0.55) divF.classList.add("life-70");
    else if (this.iLife / this.iPG > 0.35) divF.classList.add("life-45");
    else if (this.iLife / this.iPG > 0.1) divF.classList.add("life-25");
    else if (this.iLife / this.iPG > 0) divF.classList.add("life-5");
    else divF.classList.add("life-0");
    const divN = document.createElement("div");
    divN.classList.add(`life-name`);
    divN.innerHTML = this.sFullName();
    const divL = document.createElement("div");
    divL.classList.add(`life-value`);
    divL.innerHTML = `${this.iLife}`;
    const divT = document.createElement("div");
    divT.classList.add(`life-total`);
    divT.innerHTML = `${this.iPG}`;
    const btUp = document.createElement("button");
    btUp.classList.add(`life-btn`);
    btUp.innerHTML = "+";
    btUp.addEventListener("click", ()=>{
      formHealFighter(this);
    })
    const btDn = document.createElement("button");
    btDn.classList.add(`life-btn`);
    btDn.innerHTML = "-";
    btDn.addEventListener("click", ()=>{
      formDealFighter(this);
    })
    divF.appendChild(divN);
    divF.appendChild(divL);
    divF.appendChild(divT);
    divF.appendChild(btUp);
    divF.appendChild(btDn);
    parent.appendChild(divF);   
  }
  checkStates(){
    let bInc = false;
    this.states.forEach((s) => {
      bInc = s.bInca || bInc;
    })
    return bInc;
  }
  statesPassTurn(){
    this.states.forEach((s) => {
      s.iTurnos--;
    })
    this.states = this.states.filter(s => s.iTurnos>0);
  }

};

/******** Gestión de combatientes ****************/
function getFighterByInit(iInitValue) {
  let fighterName = "";
  FightersList.forEach(element => {
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
  FightersList.forEach(element => {
    if(element.sFullName() === sTestName) {
      oFighter = element;
    }
  });
  return oFighter;
};
function getLastFighterByName(sTestName) {
  let fighterNum = 0;
  FightersList.forEach(element => {
    if(element.sName === sTestName) {
      fighterNum = (element.iNumRep>fighterNum ? element.iNumRep : fighterNum);
    }
  });
  fighterNum++;
  return fighterNum;
};
function existsFighterByName(sTestName) {
  let retvalue = false;
  FightersList.forEach(element => {
    if(element.bPje && element.sName === sTestName) {
      retvalue = true;
    }
  });
  return retvalue;
};
function posInitFighterByName(sTestName) {
  for(let i=0; i<InitiativeList.length;i++) {
    if (InitiativeList[i].sFullName()===sTestName) {
      return i;
    }
  }
  return -1;
};
function posCombFighterByName(sTestName) {
  for(let i=0; i<FightersList.length;i++) {
    if (FightersList[i].sFullName()===sTestName) {
      return i;
    }
  }
  return -1;
};
function posLifeFighterByName(sTestName) {
  for(let i=0; i<LifeList.length;i++) {
    if (LifeList[i].sFullName()===sTestName) {
      return i;
    }
  }
  return -1;
};
function addFighter(bJugador, sNombre, sBonoInic, sIniciativa, bTiradaAuto, sPG){
  if(sNombre === "") return;
  if (sPG === "") sPG = "0";
  let iPG = parseInt(sPG);
  if (existsFighterByName(sNombre)) return;
  const newFighter = new fighter(sNombre, 
                                 sBonoInic, 
                                 sIniciativa, 
                                 bJugador, 
                                 getLastFighterByName(sNombre), 
                                 iPG);
  if (bTiradaAuto) newFighter.setInit(Math.floor(Math.random()*20)+1+newFighter.iInit_bon);
  FightersList.push(newFighter);
  InitiativeList.push(newFighter);
  InitiativeList.sort(fighter.sortByInit);
  LifeList.push(newFighter);
  LifeList.sort(fighter.sortByName);
  showFighters();
  updateTurn();
  showLife();
  saveLocal();
};
function editFighter(oFighter, sBonoInic, sIniciativa){
  oFighter.setBono(sBonoInic);
  oFighter.setInit(sIniciativa);
  InitiativeList.sort(fighter.sortByInit);
  showInitiative();
  showFighters();
  showLife();
  saveLocal();
};
function deleteFighter(oFighter){
  InitiativeList.splice(posInitFighterByName(oFighter.sFullName()),1);
  FightersList.splice(posCombFighterByName(oFighter.sFullName()),1);
  LifeList.splice(posLifeFighterByName(oFighter.sFullName()),1);
  if(TurnControl.fighterName === oFighter.sFullName()) nextFighter();
  else showInitiative();
  showFighters();
  showLife();
  saveLocal();
};
function dealFighter(oFighter, sDano){
  if (sDano==="") sDano="0";
  oFighter.iLife -= parseInt(sDano);
  showLife();
  showInitiative();
  saveLocal();
};
function healFighter(oFighter, sDano){
  if (sDano==="") sDano="0";
  oFighter.iLife += parseInt(sDano);
  showLife();
  showInitiative();
  saveLocal();
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
  FightersList.forEach(oFighter => { 
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
    heightInitPanel = Math.min(InitiativeList.length * hF, 200);
    if(InitiativeList.length > 12) {
      heightInitPanel = Math.ceil(InitiativeList.length/2) * hF;
    } 
  }
  else heightInitPanel = InitiativeList.length * hF;
  HTMLInitiativeList.style.height = `${heightInitPanel}px`;
  
  InitiativeList.forEach(oFighter => { oFighter.showInInitiative(HTMLInitiativeList) });
};
function showLife(){
  const HTMLLifeList = document.getElementById("life-list");
  HTMLLifeList.innerHTML = "";
  LifeList.forEach(oFighter => { oFighter.showInLife(HTMLLifeList) });
};
function checkwindowWidthChange(){
  if (lastwindowwidth+5>WidthResponsive && window.innerWidth<WidthResponsive ||
    lastwindowwidth-5<WidthResponsive && window.innerWidth>WidthResponsive) {
      lastwindowwidth = window.innerWidth;
      showInitiative();
    }
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
  const iBono = formTextInput("Bonificador de iniciativa","id-bono-iniciativa",true);
  const iInit = formTextInput("Tirada de iniciativa","id-tira-iniciativa",true);
  const iPtGP = formTextInput("Puntos de golpe (PG)","id-puntos-golpe",true);
  const iChbxJ = formCheckBox("Jugador", "chbxJugador");
  const iChbxT = formCheckBox("Tirada automatica", "chbxTiradaAuto");
  const divB = formButtons(1, ["AÑADIR"], [
    () => { addFighter(iChbxJ[1].checked, 
                       iName[2].value, 
                       iBono[2].value, 
                       iInit[2].value, 
                       iChbxT[1].checked, 
                       iPtGP[2].value); }
  ]);
  divB[0].style.borderTop = ".2rem solid var(--colorPri)";
  divB[0].style.paddingTop = ".3rem";
  divB[0].style.marginTop = ".5rem"; 
  // LOGICA
  iInit[2].disabled = true;
  iChbxT[1].checked = true;
  iChbxJ[1].addEventListener("click", ()=>{ changeCheckBox(iChbxJ[1], iChbxT[1], [iInit[2]], [iPtGP[2]])} );
  iChbxJ[2].addEventListener("click", ()=>{ changeCheckBox(iChbxJ[1], iChbxT[1], [iInit[2]], [iPtGP[2]])} );
  iChbxT[1].addEventListener("click", ()=>{ changeCheckBox(iChbxT[1], undefined, [], [iInit[2]])} );
  iChbxT[2].addEventListener("click", ()=>{ changeCheckBox(iChbxT[1], undefined, [], [iInit[2]])} );
  
  // MONTAJE
  divOpac[1].appendChild(pTit[0]);
  divOpac[1].appendChild(iChbxJ[0]);
  divOpac[1].appendChild(iName[0]);
  divOpac[1].appendChild(iBono[0]);
  divOpac[1].appendChild(iInit[0]);
  divOpac[1].appendChild(iPtGP[0]);
  divOpac[1].appendChild(iChbxT[0]);
  divOpac[1].appendChild(divB[0]);
  HTMLMain.appendChild(divOpac[0]);
};
function formEditFighter(oFighter){
  const divOpac = formPrep();
  // VISUAL
  const pTit = formTitle(oFighter.sFullName());
  pTit[2].addEventListener("click", ()=>{ divOpac[0].remove(); });
  const pTIt = formSeccion(`Iniciativa`);
  pTIt[2].style.height = "0px";
  const iBono = formTextInput("Bonificador de iniciativa","id-bono-iniciativa",true);
  const iInit = formTextInput("Tirada de iniciativa","id-tira-iniciativa",true);
  const pTEt = formSeccion(`Estados alterados`);
  pTEt[2].style.height = "0px";
  const divE = formButtons(1, ["AÑADIR"], [
    ()=>{ divOpac[0].remove(); formAddState(oFighter); showInitiative(); }
  ]);
  divE[0].style.justifyContent = "left";
  const pTEc = formSeccion(`Borrado`);
  pTEc[2].style.height = "0px";
  const divD = formButtons(1, ["ELIMINAR COMBATIENTE"], [
    ()=>{ divOpac[0].remove(); deleteFighter(oFighter, iBono[2].value, iInit[2].value); }
  ]);
  divD[0].style.justifyContent = "left";
  const divB = formButtons(1, ["ACEPTAR"], [
    ()=>{ divOpac[0].remove(); editFighter(oFighter, iBono[2].value, iInit[2].value); showInitiative();}
  ]);
  divB[0].style.borderTop = ".2rem solid var(--colorPri)";
  divB[0].style.paddingTop = ".3rem";
  divB[0].style.marginTop = ".5rem";

  
  // LOGICA
  iBono[2].value = `${oFighter.iInit_bon}`;
  iInit[2].value = `${oFighter.iInit_value}`;

  //MONTAJE
  divOpac[1].appendChild(pTit[0]);
  divOpac[1].appendChild(pTIt[0]);
  divOpac[1].appendChild(iBono[0]);
  divOpac[1].appendChild(iInit[0]);
  divOpac[1].appendChild(pTEt[0]);
  oFighter.states.forEach(stateIn => {
    divOpac[1].appendChild(stateIn.showStateInEdit(divOpac[0]));
  })
  divOpac[1].appendChild(divE[0]);
  divOpac[1].appendChild(pTEc[0]);
  divOpac[1].appendChild(divD[0]);
  divOpac[1].appendChild(divB[0]);
  HTMLMain.appendChild(divOpac[0]);
};
function formDealFighter(oFighter){
  const divOpac = formPrep();
  // VISUAL
  const pTit = formTitle(`Dañar a ${oFighter.sFullName()}`);
  pTit[2].addEventListener("click", ()=>{ divOpac[0].remove(); });
  const iDano = formTextInput("Daño causado ( - )","id-dano",true);

  const divB = formButtons(1, ["ACEPTAR"], [
    ()=>{ divOpac[0].remove(); dealFighter(oFighter, iDano[2].value); }
  ]);  
  divB[0].style.borderTop = ".2rem solid var(--colorPri)";
  divB[0].style.paddingTop = ".3rem";
  divB[0].style.marginTop = ".5rem";

  //MONTAJE
  divOpac[1].appendChild(pTit[0]);
  divOpac[1].appendChild(iDano[0]);
  divOpac[1].appendChild(divB[0]);
  HTMLMain.appendChild(divOpac[0]);
};
function formHealFighter(oFighter){
  const divOpac = formPrep();
  // VISUAL
  const pTit = formTitle(`Sanar a ${oFighter.sFullName()}`);
  pTit[2].addEventListener("click", ()=>{ divOpac[0].remove(); });
  const iDano = formTextInput("Daño sanado ( + )","id-dano",true);
  
  const divB = formButtons(1, ["ACEPTAR"], [
    ()=>{ divOpac[0].remove(); healFighter(oFighter, iDano[2].value); }
  ]);  
  divB[0].style.borderTop = ".2rem solid var(--colorPri)";
  divB[0].style.paddingTop = ".3rem";
  divB[0].style.marginTop = ".5rem";
 
  //MONTAJE
  divOpac[1].appendChild(pTit[0]);
  divOpac[1].appendChild(iDano[0]);
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
  const divB = formButtons(1, ["ACEPTAR"], [
    ()=>{
      divOpac[0].remove();
      const newState = new state( type, 
                                  iName[2].value, 
                                  iDesc[2].value, 
                                  iChbx[1].checked, 
                                  iNTrn[2].value, 
                                  oFighter.sFullName());
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
  divOpac[1].appendChild(divB[0]);
  HTMLMain.appendChild(divOpac[0]);
  autogrow(iDesc[2]);
};
function formEditState(oFighter, oState, type){
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
  const divB = formButtons(1, ["ACEPTAR","CANCELAR"], [
    ()=>{
      divOpac[0].remove();
      oState.iIcon   = type;
      oState.sName   = iName[2].value;
      oState.sDesc   = iDesc[2].value;
      oState.bInca   = iChbx[1].checked;
      oState.iTurnos = parseInt(iNTrn[2].value);
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
  divOpac[1].appendChild(divB[0]);
  HTMLMain.appendChild(divOpac[0]);
  autogrow(iDesc[2]);
};
function formSelectStateType(oFighter, oState, bNew){
  const divOpac = formPrep();
  
  const pTit = formSeccion(`Seleccionar estado alterado estandar`);
  pTit[2].style.height = "0px";

  divOpac[1].appendChild(pTit[0]);
  for(let i=0;i<standardStates.length;i++){
    let divB = formButtons(1,
      [i===0?'- Personalizado -':standardStates[i].name],
      [()=>{
        divOpac[0].remove();
        if (bNew) formAddState(oFighter, i);
        else formEditState(oFighter, oState, i);
    }])
    divOpac[1].appendChild(divB[0]);
  }

  HTMLMain.appendChild(divOpac[0]);
}

// --- MAIN ENTRY ---------------------------------------------------

window.addEventListener("load", ()=>{
  HTMLMain = document.querySelector("main");
  
  loadLocal();
  
  htmlNumTurno = document.querySelector("#num-turno");
  window.addEventListener("resize", checkwindowWidthChange);

  htmlBtnTurno = document.getElementById("btn-next-turn");
  htmlBtnTurno.addEventListener("click", ()=>{ nextFighter() });
  if (TurnControl.mode===1) htmlBtnTurno.innerHTML = "CONTINUAR"

  htmlStatsData = document.getElementById("stats-data");
  htmlLogoDado  = document.getElementById("id-logo-dado");

  const btnAddFighter = document.getElementById("btn-add-fighter");
  btnAddFighter.addEventListener("click", formNewFighter); 
  
  const btnNewCombat = document.getElementById("btn-new-combat");
  btnNewCombat.addEventListener("click", newCombat);  

  const btnClearCombat = document.getElementById("btn-clear-combat");
  btnClearCombat.addEventListener("click", clearCombat);
  
  updateTurn();
})
export const KEY = 'crianatural:dm:demo:v1';
export const statuses = {pending:'Não iniciada',active:'Em andamento',waiting:'Aguardando cliente',done:'Concluída'};
export const seed = {
 version:1, project:'Site institucional', client:'DM Construções', summary:'Um espaço para acompanhar cada passo da criação do site, do primeiro alinhamento à publicação.',
 action:'Revisar a proposta visual e reunir os comentários em uma única devolutiva.', owner:'Cliente · DM Construções', due:'',
 stages:[
 {id:'briefing',title:'Descoberta e briefing',description:'Objetivos, público e necessidades do projeto.',status:'done',progress:100},
 {id:'estrutura',title:'Estrutura e conteúdo',description:'Organização das páginas e conteúdo inicial.',status:'done',progress:100},
 {id:'visual',title:'Direção visual',description:'Layout, identidade e experiência de navegação.',status:'waiting',progress:60},
 {id:'dev',title:'Desenvolvimento',description:'Construção responsiva e implementação das páginas.',status:'pending',progress:0},
 {id:'revisao',title:'Revisão e testes',description:'Validação de conteúdo, navegação e dispositivos.',status:'pending',progress:0},
 {id:'entrega',title:'Publicação e entrega',description:'Site no ar e orientações finais de uso.',status:'pending',progress:0}],
 updates:[{id:'demo',date:null,title:'Exemplo de atualização',body:'A proposta visual está em revisão. Este histórico é ilustrativo e não representa o andamento real da DM Construções.',author:'CriaNatural · demonstração'}], documents:[]
};
export function overall(stages){return stages.length ? Math.round(stages.reduce((sum,s)=>sum+Number(s.progress),0)/stages.length):0;}
export function changeStatus(stage,status){return {...stage,status,progress:status==='done'?100:status==='pending'?0:Math.min(stage.progress,99)};}
export function safeUrl(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}}
export function validState(s){return s?.version===1 && typeof s.project==='string' && typeof s.client==='string' && typeof s.summary==='string' && typeof s.action==='string' && typeof s.owner==='string' && typeof s.due==='string' && Array.isArray(s.stages) && s.stages.every(x=>typeof x.id==='string' && typeof x.title==='string' && typeof x.description==='string' && x.status in statuses && Number.isFinite(x.progress) && x.progress>=0 && x.progress<=100 && (x.status!=='done'||x.progress===100) && (x.status!=='pending'||x.progress===0) && (!['active','waiting'].includes(x.status)||x.progress<100)) && Array.isArray(s.updates) && s.updates.every(x=>typeof x.id==='string'&&typeof x.title==='string'&&typeof x.body==='string'&&typeof x.author==='string'&&(x.date===null||typeof x.date==='string'&&Number.isFinite(Date.parse(x.date)))) && Array.isArray(s.documents)&&s.documents.every(x=>typeof x.id==='string'&&typeof x.title==='string'&&!!safeUrl(x.url));}

import React,{useEffect,useState} from 'react';
import {supabase} from './supabase';
import {validState} from './model';

export default function CloudApp({Portal}){
 const [session,setSession]=useState(null),[starting,setStarting]=useState(true),[error,setError]=useState('');
 const [projects,setProjects]=useState([]),[selected,setSelected]=useState(''),[row,setRow]=useState(null),[role,setRole]=useState('client');
 const [loading,setLoading]=useState(false),[busy,setBusy]=useState(false);
 useEffect(()=>{
  if(!supabase){setStarting(false);return;}
  let alive=true;
  supabase.auth.getSession().then(({data,error})=>{if(alive){setSession(data.session);setStarting(false);if(error)setError('Não foi possível recuperar a sessão.');}}).catch(()=>{if(alive){setStarting(false);setError('Não foi possível recuperar a sessão.');}});
  const {data}=supabase.auth.onAuthStateChange((_event,s)=>{setSession(s);setStarting(false);});
  return()=>{alive=false;data.subscription.unsubscribe();};
 },[]);
 useEffect(()=>{
  setRow(null);setProjects([]);setSelected('');setError('');
  if(!session?.user?.id)return;
  let alive=true;setLoading(true);
  supabase.from('portal_projects').select('id,state,revision').order('created_at').then(({data,error})=>{
   if(!alive)return;
   if(error)setError('Não foi possível carregar os projetos. Confira a conexão, o script SQL e as permissões.');
   else{const valid=data.filter(p=>validState(p.state));setProjects(valid);setSelected(valid[0]?.id||'');if(valid.length!==data.length)setError('Um projeto contém dados incompatíveis com esta versão.');}
   setLoading(false);
  }).catch(()=>{if(alive){setError('Falha de conexão. Entre novamente para tentar carregar.');setLoading(false);}});
  return()=>{alive=false;};
 },[session?.user?.id]);
 useEffect(()=>{
  setRow(null);setRole('client');
  if(!selected||!session?.user?.id)return;
  let alive=true;setLoading(true);
  Promise.all([supabase.from('portal_projects').select('id,state,revision').eq('id',selected).single(),supabase.from('portal_members').select('role').eq('project_id',selected).eq('user_id',session.user.id).single()]).then(([p,m])=>{
   if(!alive)return;
   if(p.error||m.error||!validState(p.data?.state))setError('Projeto indisponível ou sem permissão de acesso.');
   else{setRow(p.data);setRole(m.data.role);setError('');}setLoading(false);
  }).catch(()=>{if(alive){setError('Falha ao carregar o projeto.');setLoading(false);}});
  return()=>{alive=false;};
 },[selected,session?.user?.id]);
 async function signOut(){setError('');const {error}=await supabase.auth.signOut();if(error)setError('Não foi possível sair. Tente novamente.');}
 async function refresh(){setLoading(true);setError('');try{const {data,error}=await supabase.from('portal_projects').select('id,state,revision').eq('id',selected).single();if(error||!validState(data?.state))throw Error();setRow(data);}catch{setError('Falha ao atualizar o projeto.');}finally{setLoading(false);}}
 async function persist(state){
  if(role!=='admin')throw Error('Seu acesso permite somente leitura.');
  if(!validState(state))throw Error('Os dados não são válidos.');
  setBusy(true);
  try{const {data,error}=await supabase.rpc('portal_save_project',{p_id:row.id,p_revision:row.revision,p_state:state});
   if(error)throw Error(error.code==='40001'?'Outra pessoa alterou o projeto. Copie sua edição e clique em Atualizar dados antes de tentar novamente.':'Falha ao salvar no Supabase. Verifique a conexão e suas permissões.');
   if(!data?.[0])throw Error('Não foi possível confirmar o salvamento.');
   setRow(data[0]);
  }finally{setBusy(false);}
 }
 if(!supabase)return <AuthCard><h1>Conexão pendente</h1><p>Preencha a Project URL e a chave publicável no arquivo .env.local, depois reinicie o aplicativo.</p></AuthCard>;
 if(starting)return <AuthCard><p>Verificando sessão…</p></AuthCard>;
 if(!session)return <Login initialError={error}/>;
 return <><div className="cloud-toolbar"><span>Conectado · {session.user.email}</span>{projects.length>1&&<label>Projeto<select value={selected} disabled={loading||busy} onChange={e=>setSelected(e.target.value)}>{projects.map(p=><option key={p.id} value={p.id}>{p.state.client} · {p.state.project}</option>)}</select></label>}<div className="actions"><button className="secondary" disabled={!row||loading||busy} onClick={refresh}>Atualizar dados</button><button className="secondary" disabled={busy} onClick={signOut}>Sair</button></div></div>{error&&<div className="notice" role="alert">{error}</div>}{loading?<AuthCard><p>Carregando projeto…</p></AuthCard>:row?<Portal key={row.id+':'+session.user.id} backend={{row,role,persist,busy}}/>:<AuthCard><h1>Nenhum projeto disponível</h1><p>Seu usuário precisa ser vinculado a um projeto pelo administrador. Consulte o guia SUPABASE.md.</p></AuthCard>}</>;
}
function AuthCard({children}){return <main className="auth-page"><section className="card auth-card"><img src={import.meta.env.BASE_URL+'logo.svg'} alt="CriaNatural"/>{children}</section></main>;}
function Login({initialError}){
 const [error,setError]=useState(initialError),[busy,setBusy]=useState(false);
 return <AuthCard><p className="overline">PORTAL DE ACOMPANHAMENTO</p><h1>Entre para acompanhar.</h1><p>Use o e-mail e a senha da conta criada para você.</p><form onSubmit={async e=>{e.preventDefault();const f=new FormData(e.currentTarget);setBusy(true);setError('');try{const {error}=await supabase.auth.signInWithPassword({email:String(f.get('email')).trim(),password:String(f.get('password'))});if(error)setError('Não foi possível entrar. Confira suas credenciais e tente novamente.');}catch{setError('Falha de conexão. Tente novamente.');}finally{setBusy(false);}}}><label>E-mail<input name="email" type="email" autoComplete="username" required/></label><label>Senha<input name="password" type="password" autoComplete="current-password" required/></label>{error&&<p role="alert">{error}</p>}<button disabled={busy}>{busy?'Entrando…':'Entrar'}</button></form><p className="muted">Para criar uma conta ou recuperar o acesso, contate o administrador do portal.</p></AuthCard>;
}

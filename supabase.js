const SUPABASE_URL='https://lpxthbsgmtbjgxwpzmta.supabase.co';
const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxweHRoYnNnbXRiamd4d3B6bXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MTQ5NDIsImV4cCI6MjEwNTM5MDk0Mn0.8zvN4-YAN03y-Gt-eflUxC-B2nO4gp1lX4V8Jsz5Elc';

const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce',storage:window.localStorage}});

const toDb=x=>({id:x.id,name:x.name,price:Number(x.price)||0,currency:x.currency||'EUR',renewal_date:x.renewalDate,frequency:x.frequency,category:x.category||null,cancel_before_renewal:!!x.cancelBeforeRenewal,logo:x.logo||null});
const fromDb=r=>({id:r.id,name:r.name,price:Number(r.price)||0,currency:r.currency||'EUR',renewalDate:r.renewal_date,frequency:r.frequency,category:r.category||'',cancelBeforeRenewal:!!r.cancel_before_renewal,logo:r.logo||''});

window.db={
 client:sb,
 async currentUser(){const {data}=await sb.auth.getUser();return data.user||null},
 async currentSession(){const {data}=await sb.auth.getSession();return data.session||null},
 async list(){const {data,error}=await sb.from('subscriptions').select('*').order('renewal_date',{ascending:true});if(error)throw error;return (data||[]).map(fromDb)},
 async upsert(item){const u=await this.currentUser();if(!u)throw new Error('No hay sesión');const row={...toDb(item),user_id:u.id};const {error}=await sb.from('subscriptions').upsert(row,{onConflict:'id'});if(error)throw error},
 async remove(id){const {error}=await sb.from('subscriptions').delete().eq('id',id);if(error)throw error},

 async signInPassword(email,password){const {error}=await sb.auth.signInWithPassword({email,password});if(error)throw error},
 async signUpPassword(email,password){const redirectTo=`${location.origin}${location.pathname}`;const {data,error}=await sb.auth.signUp({email,password,options:{emailRedirectTo:redirectTo}});if(error)throw error;return data},
 async sendMagicLink(email){const redirectTo=`${location.origin}${location.pathname}`;const {error}=await sb.auth.signInWithOtp({email,options:{emailRedirectTo:redirectTo,shouldCreateUser:false}});if(error)throw error},
 async requestPasswordReset(email){const redirectTo=`${location.origin}${location.pathname}?flow=recovery`;const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo});if(error)throw error},
 async updatePassword(newPassword){const {error}=await sb.auth.updateUser({password:newPassword});if(error)throw error},
 async signOut(){await sb.auth.signOut()},
 onAuthChange(cb){return sb.auth.onAuthStateChange((event,session)=>cb(session?.user||null,event))}
};

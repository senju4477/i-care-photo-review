export const SERVICE_IDS=['personal-care','household-tasks','daily-tasks-shared-living','housing-tenancy','travel-transport','social-community-participation','group-centre-activities','innovative-community-participation','independent-living-skills','life-transitions','employment-support','unsure'];
export function validateForm(raw,step=null){
 const data={}; for(const [k,v] of Object.entries(raw||{}))if(typeof v==='string'||(k==='consent'&&typeof v==='boolean'))data[k]=typeof v==='string'?v.trim():v;
 const errors={};const kind=data.kind;
 if(kind==='referral')data.method='email';
 const add=(key,msg)=>{if(!errors[key])errors[key]=msg};
 if(!['enquiry','referral','feedback'].includes(kind))add('kind','Choose a valid form.');
 if(data.website)add('website','We could not process this request. Please contact the team.');
 const contact=step===null||step===0, support=step===null||step===1, permission=step===null||step===2;
 if(contact){
  if(kind!=='feedback'&&!data.name)add('name','Enter your name.');
  if(data.name&&data.name.length>120)add('name','Use a name of 120 characters or fewer.');
  if(!['email','phone',...(kind==='feedback'?['none']:[])].includes(data.method))add('method','Choose how you would like to be contacted.');
  if(data.method==='email'&&!data.email)add('email','Enter your email address.');
  if(data.method==='phone'&&!data.phone)add('phone','Enter your phone number.');
  if(data.email&&(data.email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)||/[\r\n]/.test(data.email)))add('email','Enter a valid email address.');
  if(data.phone&&(!/^[+\d()\s.-]{6,30}$/.test(data.phone)||data.phone.replace(/\D/g,'').length<6))add('phone','Enter a valid phone number.');

 }
 if(support){
  if(kind==='enquiry'&&!SERVICE_IDS.includes(data.service))add('service','Choose a support option, or “I’m not sure yet”.');
  if(kind==='feedback'&&!['suggestion','compliment','concern'].includes(data.feedbackType))add('feedbackType','Choose a feedback type.');
  if(['feedback','referral'].includes(kind)&&!data.message)add('message',kind==='referral'?'Enter the reason for referral.':'Enter your feedback.');
  if(data.message&&data.message.length>2000)add('message','Keep your message to 2,000 characters or fewer.');
  for(const key of ['participant','relationship','suburb'])if(data[key]&&data[key].length>120)add(key,'Use 120 characters or fewer.');
 }
 if(permission&&kind!=='referral'&&!['on',true,'true'].includes(data.consent))add('consent','Confirm that you have read the privacy information and agree.');
 return {valid:Object.keys(errors).length===0,errors,data};
}

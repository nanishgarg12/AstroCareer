import bcrypt from 'bcrypt';
import {mongoose,Course,Career,Question,Skill,User} from './models/index.js';
import {config} from './config.js';
const careers=[['Software Developer',['JavaScript','DSA','OOP','DBMS']],['Full Stack Developer',['JavaScript','React','Node.js','MongoDB']],['AI/ML Engineer',['Python','Machine Learning','Statistics','SQL']],['Data Scientist',['Python','Statistics','SQL','Machine Learning']],['Data Analyst',['SQL','Excel','Python','Statistics']],['Cybersecurity Analyst',['Networking','Linux','Security','Python']],['Cloud Engineer',['AWS','Linux','Networking','Docker']],['DevOps Engineer',['Docker','CI/CD','Linux','Kubernetes']],['UI/UX Designer',['Figma','Research','Prototyping','Design']],['Product Manager',['Research','Communication','Analytics','Strategy']],['Business Analyst',['SQL','Communication','Analytics','Excel']],['Digital Marketing',['SEO','Content','Analytics','Communication']],['Financial Analyst',['Excel','Finance','Statistics','SQL']],['HR',['Communication','Recruiting','Empathy','Organization']],['Mechanical Engineer',['CAD','Thermodynamics','Manufacturing','Design']],['Civil Engineer',['AutoCAD','Structures','Surveying','Project Management']],['Electrical Engineer',['Circuit Design','Power Systems','MATLAB','Electronics']],['Electronics Engineer',['Electronics','Embedded C','PCB Design','Signal Processing']]];
const questionTemplates = (career:string, skill:string) => [
 {category:'Applied practice',question:`Which activity is the strongest evidence that you can apply ${skill} as a ${career}?`,options:[`Build and explain a small ${skill} project with tests or outcomes`,'Read unrelated articles without practising','Memorize definitions only','Avoid feedback on your work'],correctAnswer:0,explanation:`Applied work, feedback, and evidence of results demonstrate practical ${skill} ability.`},
 {category:'Problem solving',question:`When a ${skill} task produces an unexpected result, what should you do first?`,options:['Change several things at once','Reproduce the issue, inspect the evidence, then test one fix at a time','Assume the tool is broken','Ignore the result if the deadline is close'],correctAnswer:1,explanation:'A repeatable investigation and a focused test make the cause and fix reliable.'},
 {category:'Professional practice',question:`What is the best way to communicate a ${skill} decision to a teammate?`,options:['State the choice without context','Explain the goal, options considered, trade-offs, and how you will verify it','Use only technical jargon','Wait until after release to discuss it'],correctAnswer:1,explanation:'Good professional decisions are clear about the goal, trade-offs, and verification plan.'}
];
try{
 await mongoose.connect(config.mongo,{serverSelectionTimeoutMS:10000});
 await Course.bulkWrite(['B.Tech','BCA','MCA','BBA','MBA','B.Sc','M.Sc','BA','MA','Diploma'].map(name=>({updateOne:{filter:{name},update:{$set:{name,specializations:['General','Technology','Business']}},upsert:true}})));
 for(const [name,skills] of careers as [string,string[]][]){
  await Career.updateOne({name},{$set:{name,description:`A career path in ${name} that rewards structured learning and applied projects.`,requiredSkills:skills,preferredSkills:skills.slice(0,2),technicalSkills:skills,softSkills:['Communication','Problem solving'],recommendedCourses:['B.Tech','BCA','MCA'],interviewCategories:['Technical','Problem Solving','Behavioral','HR'],roadmap:skills.map((skill,i)=>({title:`Week ${i+1}: ${skill}`,skill,description:`Learn and practise ${skill} with a small project.`,difficulty:i>1?'Intermediate':'Foundation',estimatedTime:'4 hours'}))}},{upsert:true});
  for(const skill of skills){
   await Skill.updateOne({name:skill},{$set:{name:skill,category:'Technical'}},{upsert:true});
   for(const item of questionTemplates(name,skill)) await Question.updateOne({career:name,skill,category:item.category},{$set:{career:name,skill,...item,difficulty:'Foundation',marks:10}},{upsert:true});
  }
 }
 const email=process.env.ADMIN_EMAIL||'admin@astrocareer.local',pass=process.env.ADMIN_PASSWORD||'ChangeMe123!';await User.updateOne({email},{$set:{name:'AstroCareer Admin',email,passwordHash:await bcrypt.hash(pass,12),role:'admin'}},{upsert:true});console.log('Seed complete');
}catch(error){
 const message=error instanceof Error?error.message:String(error);
 console.error('Seed failed because MongoDB could not be reached.');
 console.error(message);
 console.error('Check your MongoDB Atlas URI, Atlas Network Access IP allowlist, and DNS/internet connection.');
 process.exitCode=1;
}finally{
 await mongoose.disconnect();
}

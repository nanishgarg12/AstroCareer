import {Career,Question,AssessmentAttempt,InterviewMessage,InterviewEvaluation,StudentProfile,RoadmapTask} from '../models/index.js';
const signs=['Capricorn','Aquarius','Pisces','Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius'];
export const astrologyService={get(date?:string){const d=date?new Date(date):new Date(); const sign=signs[(d.getMonth()+(d.getDate()>20?1:0))%12]; return {zodiac:sign,daily:`${sign}: focus on one practical learning goal today.`,monthly:`This month rewards steady practice and reflective career choices.`,personality:'A self-reflection prompt, not an astronomical assessment.',disclaimer:'Astrology is provided for entertainment and self-reflection.'}}};
export const scoringService={readiness(a=0,i=0,skills=0,projects=0){const score=Math.round(a*.35+i*.35+skills*.20+projects*.10);const level=score<40?'Beginner':score<60?'Developing':score<75?'Almost Ready':score<90?'Job Ready':'Strong Candidate';return {score,level,weights:{assessment:35,interview:35,skills:20,projectsExperience:10}}}};
export const careerService = {
  async list(userId?: string) {
    if (!userId) {
      return Career.find().lean();
    }

    const profile = await StudentProfile.findOne({
      user: userId
    }).lean();

    if (!profile) {
      return Career.find().lean();
    }

    const course = (profile.course || "").toLowerCase();
    const specialization = (
      profile.specialization || ""
    ).toLowerCase();

    const skills = (profile.skills || []).map(
      skill => skill.toLowerCase()
    );

    const interests = (profile.interests || []).map(
      interest => interest.toLowerCase()
    );

    const careers = await Career.find().lean();

    const scored = careers.map(career => {
      const careerText = `
        ${career.name}
        ${career.description}
        ${(career.requiredSkills || []).join(" ")}
      `.toLowerCase();

      let score = 0;

      if (
        course &&
        careerText.includes(course)
      ) {
        score += 50;
      }

      if (
        specialization &&
        careerText.includes(specialization)
      ) {
        score += 30;
      }

      for (const skill of skills) {
        if (careerText.includes(skill)) {
          score += 10;
        }
      }

      for (const interest of interests) {
        if (careerText.includes(interest)) {
          score += 5;
        }
      }

      return {
        ...career,
        matchScore: score
      };
    });

    return scored.sort(
      (a, b) =>
        b.matchScore - a.matchScore
    );
  },

  async detail(name: string) {
    return Career.findOne({ name }).lean();
  }
};
export const assessmentService={async questions(career:string){return Question.find({career}).select('-correctAnswer -explanation').lean()},async submit(user:string,career:string,answers:number[]){const qs=await Question.find({career});if(!qs.length)throw new Error('No questions available for this career');let earned=0,total=0;const skills:Record<string,[number,number]>={};qs.forEach((q,i)=>{total+=q.marks;const hit=answers[i]===q.correctAnswer;if(hit)earned+=q.marks;const x=skills[q.skill]||[0,0];x[1]+=q.marks;if(hit)x[0]+=q.marks;skills[q.skill]=x});const skillScores=Object.fromEntries(Object.entries(skills).map(([k,[v,t]])=>[k,Math.round(v/t*100)]));const score=Math.round(earned/total*100);await AssessmentAttempt.create({user,career,answers,score,skillScores});return {score,skillScores,strengths:Object.keys(skillScores).filter(k=>skillScores[k]>=70),improvementAreas:Object.keys(skillScores).filter(k=>skillScores[k]<70)}}};
export const interviewService={async reply(interview:string,answer:string){const quality=Math.min(100,Math.max(35,40+answer.trim().split(/\s+/).length*2+(answer.toLowerCase().includes('example')?10:0)));await InterviewMessage.create({interview,role:'student',content:answer});const evaluation={technicalScore:quality,problemSolvingScore:Math.max(30,quality-5),communicationScore:Math.min(100,quality+4),relevanceScore:quality,overallScore:quality,strengths:quality>70?['Clear, substantive response']:['You started the response'],weaknesses:quality<70?['Add a specific example and trade-offs']:[],feedback:'Fallback evaluation based on response completeness. Configure AI_API_KEY for model-based evaluation.',improvements:['Use STAR structure and mention measurable outcomes.']};await InterviewEvaluation.findOneAndUpdate({interview},evaluation,{upsert:true});return {evaluation,nextQuestion:'Tell me about a project where you solved a difficult technical problem.'}}};
export const recommendationService={async match(user:string){const p=await StudentProfile.findOne({user}).lean();const careers=await Career.find().lean();const skills=(p?.skills||[]).map(s=>s.toLowerCase());return careers.map(c=>{const req=c.requiredSkills||[];const hit=req.filter(s=>skills.includes(s.toLowerCase())).length;const interest=(p?.interests||[]).some(x=>c.name.toLowerCase().includes(x.toLowerCase()))?15:0;const score=Math.min(100,Math.round((req.length?hit/req.length:0)*65+interest+10+(p?.projects||0)*2));return {career:c.name,score,reason:`${hit}/${req.length} required skills currently listed${interest?' and an interest alignment':''}.`}}).sort((a,b)=>b.score-a.score)}};
export const roadmapService = {
  async create(user: string, career: any) {

    await RoadmapTask.deleteMany({
      user,
      career: career.name
    });

    await RoadmapTask.insertMany(
      (career.roadmap || []).map((x: any) => ({
        user,
        career: career.name,
        title: x.title,
        skill: x.skill,
        description: x.description,
        difficulty: x.difficulty,
        estimatedTime: x.estimatedTime,
        completed: false
      }))
    );

    return RoadmapTask.find({
      user,
      career: career.name
    }).lean();
  }
};
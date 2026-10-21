import { useState, useEffect } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";

// Part A: 自己調整資源（20項目）— スケール：まったくできない〜よくできる
const QUESTIONS_A = [
  { d:0, text:"自分の得意なことと苦手なことを、具体的に説明できる" },
  { d:0, text:"仕事で疲れてきたとき、身体の変化（頭痛・肩こり・眠気など）として自分でわかることがある" },
  { d:0, text:"自分が「調子が悪い状態」になっていることを、その場で自覚できる" },
  { d:0, text:"過去のミスや困りごとから、自分の行動パターンを振り返ることができる" },
  { d:0, text:"自分の困りごとが「性格」や「努力不足」ではなく、脳の特性からきているかもしれないと考えることができる" },
  { d:1, text:"複数の仕事がある場合、何から手をつけるか順番を決めることができる" },
  { d:1, text:"集中しにくいと感じたとき、環境を変えるなど自分で対処することができる" },
  { d:1, text:"締め切りや予定の管理を、自分でできる" },
  { d:1, text:"電話・入力・声かけなど複数のことが同時に起きても、頭の処理が追いつくことができる" },
  { d:1, text:"感情が動いたとき（怒り・不安・悲しみなど）、すぐに行動や言葉に出さずに落ち着くことができる" },
  { d:2, text:"仕事でわからないことがあったとき、上司や同僚に質問することができる" },
  { d:2, text:"困りごとが大きくなる前に、誰かに相談することができる" },
  { d:2, text:"自分が必要としている配慮や働き方の工夫を、職場の人に伝えることができる" },
  { d:2, text:"仕事で困っていることがあっても、職場に言い出すことができる" },
  { d:2, text:"仕事上の失敗やミスを、一人で抱え込まずに処理することができる" },
  { d:3, text:"仕事の疲れが蓄積しているとき、休む・ペースを落とすなどの行動をとることができる" },
  { d:3, text:"職場で無理に「普通にできている人」のように振る舞わずにいることができる" },
  { d:3, text:"疲れたとき、自分に合った回復方法（睡眠・趣味・一人の時間など）を選ぶことができる" },
  { d:3, text:"仕事の後、その日の出来事を引きずらずに切り替えることができる" },
  { d:4, text:"今の職場の環境が、自分に合っているかどうかを判断することができる" },
  { d:4, text:"自分がどんな職場環境だと力を発揮しやすいか、具体的に説明できる" },
  { d:4, text:"仕事のやり方や環境について、改善してほしいことを職場に伝えることができる" },
  { d:4, text:"今の仕事や職場環境でうまくいかないとき、何が原因かを言葉にできる" },
  { d:4, text:"転職や配置換えを考えるとき、「自分に何が必要か」をもとに判断することができる" },
];

// Part B: 困難・消耗の自覚（7項目）— スケール：ほとんどない〜よくある（過去1ヶ月）
const QUESTIONS_B = [
  { text:"感情が動いたとき（怒り・不安・悲しみなど）、すぐに行動や言葉に出てしまうことがある" },
  { text:"電話・入力・声かけなど複数のことが同時に起きると、頭の処理が追いつかなくなることがある" },
  { text:"仕事で困っていることがあっても、「大げさかな」「迷惑かな」と思って職場に言い出せないことがある" },
  { text:"職場で「普通にできている人」のように振る舞うことに、内側でエネルギーを消耗していることがある" },
  { text:"仕事の後、頭の中でその日の出来事をくり返し考え続けることがある" },
  { text:"他の人が短時間でこなせることに、自分は倍以上の時間やエネルギーがかかることがある" },
  { text:"仕事が終わると、何もできないほど消耗していることがある" },
];

const SCALE_A = ["まったくできない","あまりできない","だいたいできる","よくできる"];
const SCALE_B = ["ほとんどない","あまりない","ときどきある","よくある"];
const TOTAL_Q = QUESTIONS_A.length + QUESTIONS_B.length; // 24+7=31

const DOMAINS = [
  { id:0, name:"自己認識", short:"自己認識", color:"#7F77DD", bg:"#EEEDFE", text:"#3C3489" },
  { id:1, name:"自己調整", short:"自己調整", color:"#1D9E75", bg:"#E1F5EE", text:"#085041" },
  { id:2, name:"支援要請", short:"支援要請", color:"#D85A30", bg:"#FAECE7", text:"#712B13" },
  { id:3, name:"ストレス管理", short:"ストレス", color:"#BA7517", bg:"#FAEEDA", text:"#633806" },
  { id:4, name:"環境適合", short:"環境適合", color:"#378ADD", bg:"#E6F1FB", text:"#0C447C" },
];

const STORAGE_KEY = "metacog_v4_history";
const JOURNAL_KEY  = "metacog_v3_journal";

const CATEGORIES = [
  { id:"work",    label:"仕事",     color:"#EEEDFE", text:"#3C3489" },
  { id:"human",   label:"人間関係", color:"#E1F5EE", text:"#085041" },
  { id:"love",    label:"恐愛",     color:"#FAECE7", text:"#712B13" },
  { id:"friends", label:"友人",     color:"#FAEEDA", text:"#633806" },
  { id:"body",    label:"体調",     color:"#E6F1FB", text:"#0C447C" },
  { id:"other",   label:"その他", color:"#f3f2ef", text:"#4a4845" },
];

const MOOD_LABELS = ["かなりしんどい","しんどい","ふつう","まあまあ良い","絶好調"];
const MOOD_ICONS  = ["😞","😟","😐","🙂","😊"];
const MOOD_COLORS = ["#D85A30","#BA7517","#9c9a92","#1D9E75","#7F77DD"];

function calcScores(ansA, ansB) {
  // Part A: 5領域スコア（各4問、1〜4点）
  const s=[0,0,0,0,0],c=[0,0,0,0,0];
  QUESTIONS_A.forEach((q,i)=>{ if(ansA[i]==null)return; s[q.d]+=(ansA[i]+1);c[q.d]++; });
  const scA=s.map((v,i)=>c[i]?Math.round(v/c[i]*10)/10:0);
  // Part B: 合計スコア（1〜4点、高いほど困難・消耗が大きい）
  let bSum=0,bCount=0;
  ansB.forEach(v=>{ if(v!=null){bSum+=(v+1);bCount++;} });
  const scB=bCount?Math.round(bSum/bCount*10)/10:0;
  return {a:scA, b:scB};
}

function buildShare(scA) {
  const items=[];
  const top=scA.indexOf(Math.max(...scA));
  const ns=["自己理解・特性の説明","自己調整・段取り","支援を求める力","体調・ストレス管理","環境適合の判断"];
  items.push({id:"s0",label:"得意なこと",text:`${ns[top]}が比較的得意です。この強みを活かせる役割や仕事スタイルだと力を発揮しやすいです。`});
  if(scA[1]<2.5)items.push({id:"s1",label:"配慮依頼：優先順位の整理",text:"複数タスクが重なるときは、優先順位を一緒に確認する時間を設けてもらえると助かります。"});
  if(scA[2]<2.5)items.push({id:"s2",label:"配慮依頼：相談しやすい環境",text:"困りごとを自分から報告するのが苦手な傾向があります。定期的な1on1の機会があると問題が大きくなる前に相談できます。"});
  if(scA[3]<2.5)items.push({id:"s3",label:"配慮依頼：疲労への配慮",text:"表面上は問題なく見えていても、内側で消耗していることがあります。定期的な状態確認の機会があると助かります。"});
  if(scA[4]<2.5)items.push({id:"s4",label:"配慮依頼：作業環境",text:"静かな環境や集中できる個人スペースがあると作業効率が上がります。"});
  items.push({id:"s9",label:"参考情報",text:"このシートは自己アセスメントツールによる結果をもとに作成しています。医療的な診断ではありませんが、自分の働きやすさを整理したものです。"});
  return items;
}

const fmt=(iso)=>{ const d=new Date(iso); return `${d.getMonth()+1}/${d.getDate()}`; };
const fmtFull=(iso)=>{ const d=new Date(iso); return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`; };

function Delta({v}){
  if(v==null)return null;
  const up=v>0.05,dn=v<-0.05;
  return <span style={{fontSize:11,padding:"1px 7px",borderRadius:10,background:up?"#E1F5EE":dn?"#FAECE7":"#f3f2ef",color:up?"#085041":dn?"#712B13":"#73726c",marginLeft:5}}>{up?"+":""}{v.toFixed(1)}</span>;
}

// ── リマインダー設定 ──────────────────────────────────────────────────────
function ReminderSetting() {
  const [open,setOpen]=useState(false);
  const [hour,setHour]=useState(21);
  const [min,setMin]=useState(0);
  const hours=Array.from({length:24},(_,i)=>i);
  const mins=[0,15,30,45];
  const presets=[
    {label:"退勤後 17:00",h:17,m:0},
    {label:"夕食後 20:00",h:20,m:0},
    {label:"就寢前 21:00",h:21,m:0},
    {label:"就寢前 22:00",h:22,m:0},
    {label:"寝る直前 23:00",h:23,m:0},
  ];

  const download=()=>{
    const hh=String(hour).padStart(2,"0"), mm=String(min).padStart(2,"0");
    const nh=min===45?(hour+1)%24:hour, nm=min===45?0:min+15;
    const ics=[
      "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//MetaCog//JP",
      "BEGIN:VEVENT",
      "DTSTART;TZID=Asia/Tokyo:20250101T"+hh+mm+"00",
      "DTEND;TZID=Asia/Tokyo:20250101T"+String(nh).padStart(2,"0")+String(nm).padStart(2,"0")+"00",
      "RRULE:FREQ=DAILY",
      "SUMMARY:今日の日誌を書く",
      "BEGIN:VALARM","TRIGGER:-PT0M","ACTION:DISPLAY",
      "DESCRIPTION:日誌の時間です",
      "END:VALARM","END:VEVENT","END:VCALENDAR",
    ].join("\r\n");
    const blob=new Blob([ics],{type:"text/calendar;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url; a.download="journal_reminder.ics"; a.click();
    URL.revokeObjectURL(url);
  };

  return(
    <div style={{background:"#f3f2ef",borderRadius:12,padding:"1rem 1.1rem",marginBottom:12}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
        <div>
          <div style={{fontSize:13,fontWeight:700}}>毎日のリマインダーを設定する</div>
          <div style={{fontSize:12,color:"#73726c",marginTop:2}}>カレンダーアプリに追加して通知を受け取る</div>
        </div>
        <span style={{color:"#73726c",transform:open?"rotate(180deg)":"none",transition:"transform .2s",fontSize:18}}>▾</span>
      </div>
      {open&&(
        <div style={{marginTop:"1rem"}}>
          <div style={{fontSize:12,color:"#4a4845",lineHeight:1.7,marginBottom:"1rem",padding:".75rem",background:"#fff",borderRadius:8}}>
            通知を受け取りたい時間を選んで「カレンダーに追加」を押すと、毎日その時間に通知が届きます。<br/>
            <span style={{fontSize:11,color:"#9c9a92"}}>※ iPhoneカレンダールGoogleカレンダールOutlookなどに対応</span>
          </div>
          <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>通知時間</div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:"1rem"}}>
            <select value={hour} onChange={e=>setHour(Number(e.target.value))} style={{flex:1,padding:"10px 12px",borderRadius:10,border:"0.5px solid #d4d2cb",fontSize:15,background:"#fff",outline:"none"}}>
              {hours.map(h=><option key={h} value={h}>{String(h).padStart(2,"0")}時</option>)}
            </select>
            <span style={{fontSize:18}}>:</span>
            <select value={min} onChange={e=>setMin(Number(e.target.value))} style={{flex:1,padding:"10px 12px",borderRadius:10,border:"0.5px solid #d4d2cb",fontSize:15,background:"#fff",outline:"none"}}>
              {mins.map(m=><option key={m} value={m}>{String(m).padStart(2,"0")}分</option>)}
            </select>
          </div>
          <div style={{fontSize:12,color:"#73726c",marginBottom:8}}>よく使われる時間帯</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:"1.25rem"}}>
            {presets.map(p=>(
              <button key={p.label} onClick={()=>{setHour(p.h);setMin(p.m);}} style={{padding:"6px 12px",borderRadius:20,fontSize:12,border:hour===p.h&&min===p.m?"1.5px solid #1a1917":"0.5px solid #d4d2cb",background:hour===p.h&&min===p.m?"#1a1917":"#fff",color:hour===p.h&&min===p.m?"#fff":"#4a4845",cursor:"pointer"}}>
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={download} style={{display:"block",width:"100%",padding:12,background:"#1a1917",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer"}}>
            毎日 {String(hour).padStart(2,"0")}:{String(min).padStart(2,"0")} にカレンダーへ追加
          </button>
          <div style={{fontSize:11,color:"#9c9a92",textAlign:"center",marginTop:8,lineHeight:1.6}}>
            ダウンロードされたファイルをタップすると<br/>カレンダーアプリに追加できます
          </div>
        </div>
      )}
    </div>
  );
}

// ── ナビゲーション ────────────────────────────────────────────────────────
function NavBar({screen,setScreen}){
  const tabs=[
    {id:"top",    label:"ホーム", icon:"🏠"},
    {id:"journal",label:"日誌",     icon:"📓"},
    {id:"history",label:"変化",     icon:"📈"},
  ];
  return(
    <div style={{display:"flex",borderTop:"0.5px solid #e2e0d8",background:"#fff",position:"sticky",bottom:0,zIndex:10}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>setScreen(t.id)} style={{flex:1,padding:"10px 4px 8px",border:"none",background:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
          <span style={{fontSize:18}}>{t.icon}</span>
          <span style={{fontSize:10,color:screen===t.id?"#1a1917":"#9c9a92",fontWeight:screen===t.id?700:400}}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── メインアプリ ──────────────────────────────────────────────────────────
export default function App(){
  const [screen,setScreen]=useState("top");
  const [cur,setCur]=useState(0);
  const [part,setPart]=useState("A"); // "A" or "B"
  const [answersA,setAnswersA]=useState(Array(QUESTIONS_A.length).fill(null));
  const [answersB,setAnswersB]=useState(Array(QUESTIONS_B.length).fill(null));
  const [history,setHistory]=useState([]);
  const [journal,setJournal]=useState([]);
  const [loading,setLoading]=useState(true);
  const [shareOpen,setShareOpen]=useState(false);
  const [shareChecked,setShareChecked]=useState({});
  const [copied,setCopied]=useState(false);
  const [jMood,setJMood]=useState(2);
  const [jCats,setJCats]=useState([]);
  const [jWhat,setJWhat]=useState("");
  const [jFeel,setJFeel]=useState("");
  const [jNext,setJNext]=useState("");
  const [jSaved,setJSaved]=useState(false);

  useEffect(()=>{
    try{
      const h=localStorage.getItem(STORAGE_KEY);
      if(h)setHistory(JSON.parse(h));
    }catch{}
    try{
      const j=localStorage.getItem(JOURNAL_KEY);
      if(j)setJournal(JSON.parse(j));
    }catch{}
    setLoading(false);
  },[]);

  const save=(h)=>{setHistory(h);try{localStorage.setItem(STORAGE_KEY,JSON.stringify(h));}catch{}};
  const saveJ=(j)=>{setJournal(j);try{localStorage.setItem(JOURNAL_KEY,JSON.stringify(j));}catch{}};
  const startQuiz=()=>{
    setAnswersA(Array(QUESTIONS_A.length).fill(null));
    setAnswersB(Array(QUESTIONS_B.length).fill(null));
    setCur(0);setPart("A");setScreen("quiz");
  };

  const finish=()=>{
    const sc=calcScores(answersA,answersB);
    const next=[...history,{date:new Date().toISOString(),scores:sc.a,scoreB:sc.b}];
    save(next);
    const init={};buildShare(sc.a).forEach(s=>{init[s.id]=true;});
    setShareChecked(init);setShareOpen(false);setScreen("result");
  };

  const submitJ=()=>{
    if(!jWhat.trim()&&!jFeel.trim())return;
    const next=[{id:Date.now(),date:new Date().toISOString(),mood:jMood,categories:jCats,what:jWhat.trim(),feel:jFeel.trim(),next:jNext.trim()},...journal];
    saveJ(next);
    setJMood(2);setJCats([]);setJWhat("");setJFeel("");setJNext("");
    setJSaved(true);setTimeout(()=>setJSaved(false),2000);
  };

  const toggleCat=(id)=>setJCats(c=>c.includes(id)?c.filter(x=>x!==id):[...c,id]);
  const lineData=history.map(h=>{const row={name:fmt(h.date),full:fmtFull(h.date)};DOMAINS.forEach((d,i)=>{row[d.short]=h.scores[i];});return row;});

  if(loading)return <div style={{padding:"3rem",textAlign:"center",color:"#9c9a92",fontSize:14}}>読み込み中...</div>;

  // TOP
  if(screen==="top")return(
    <div style={{paddingBottom:"60px"}}>
      <div style={{padding:"1.5rem 1.5rem 0"}}>
        <div style={{textAlign:"center",marginBottom:"1.75rem"}}>
          <div style={{fontSize:11,letterSpacing:".1em",color:"#9c9a92",textTransform:"uppercase",marginBottom:".5rem"}}>Self-Assessment Tool</div>
          <div style={{fontSize:24,fontWeight:700,lineHeight:1.3,marginBottom:".75rem"}}>自分の働き方の<br/>特性を知る</div>
          <div style={{fontSize:13,color:"#4a4845",lineHeight:1.75,marginBottom:"1.5rem"}}>診断ではありません。仕事での困りやすさと強みを整理して、自分に合う働き方を見つけるツールです。</div>
          <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginBottom:"1.75rem"}}>
            {DOMAINS.map(d=><span key={d.id} style={{padding:"4px 10px",borderRadius:20,fontSize:12,fontWeight:500,background:d.bg,color:d.text}}>{d.name}</span>)}
          </div>
        </div>
        {history.length>0&&(
          <div style={{background:"#f3f2ef",borderRadius:12,padding:"1rem 1.1rem",marginBottom:"1.25rem"}}>
            <div style={{fontSize:12,color:"#73726c",marginBottom:6}}>アセスメント記録 — {history.length}回</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {history.slice(-2).map((h,i)=><span key={i} style={{fontSize:12,padding:"3px 10px",borderRadius:10,background:"#fff",color:"#4a4845",border:"0.5px solid #e2e0d8"}}>{fmtFull(h.date)}</span>)}
            </div>
          </div>
        )}
        {journal.length>0&&(
          <div style={{background:"#f3f2ef",borderRadius:12,padding:"1rem 1.1rem",marginBottom:"1.25rem"}}>
            <div style={{fontSize:12,color:"#73726c",marginBottom:6}}>日誌 — {journal.length}件</div>
            <div style={{fontSize:13,color:"#4a4845"}}>{fmtFull(journal[0].date)}の記録があります</div>
            <button onClick={()=>setScreen("journal")} style={{marginTop:6,fontSize:12,color:"#378ADD",background:"none",border:"none",cursor:"pointer",padding:0}}>今日の日誌を書く →</button>
          </div>
        )}
        <button onClick={startQuiz} style={{display:"block",width:"100%",padding:14,background:"#1a1917",color:"#fff",border:"none",borderRadius:12,fontSize:15,fontWeight:700,cursor:"pointer",marginBottom:10}}>アセスメントを受ける（31問・約8分）</button>
        <button onClick={()=>setScreen("journal")} style={{display:"block",width:"100%",padding:12,background:"transparent",border:"0.5px solid #d4d2cb",borderRadius:12,fontSize:13,color:"#4a4845",cursor:"pointer"}}>今日の日誌を書く</button>
      </div>
      <NavBar screen={screen} setScreen={setScreen}/>
    </div>
  );

  // QUIZ — Part B 教示画面
  if(screen==="quiz" && part==="B_intro"){
    return(
      <div style={{padding:"2rem 1.5rem",display:"flex",flexDirection:"column",minHeight:"80vh",justifyContent:"center"}}>
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <div style={{fontSize:13,fontWeight:700,padding:"4px 14px",borderRadius:20,background:"#FAEEDA",color:"#633806",display:"inline-block",marginBottom:"1.25rem"}}>Part B — 困難・消耗の自覚</div>
          <div style={{fontSize:20,fontWeight:700,lineHeight:1.4,marginBottom:"1rem"}}>過去1ヶ月を<br/>振り返って答えてください</div>
          <div style={{fontSize:14,color:"#4a4845",lineHeight:1.8,marginBottom:"1.5rem"}}>ここからの7問は、<br/>この1ヶ月間でどのくらい<br/>あてはまるかを選んでください。</div>
          <div style={{fontSize:12,color:"#9c9a92",lineHeight:1.7,padding:"1rem",background:"#f3f2ef",borderRadius:10}}>
            固有の特性によるものか、<br/>一時的な状況によるものかを<br/>区別するための期間設定です。
          </div>
        </div>
        <button onClick={()=>{setCur(0);setPart("B");}} style={{display:"block",width:"100%",padding:14,background:"#1a1917",color:"#fff",border:"none",borderRadius:12,fontSize:15,fontWeight:700,cursor:"pointer"}}>
          次へ →
        </button>
      </div>
    );
  }

  // QUIZ — Part A / Part B 問題画面
  if(screen==="quiz"){
    const isB=part==="B";
    const questions=isB?QUESTIONS_B:QUESTIONS_A;
    const answers=isB?answersB:answersA;
    const scale=isB?SCALE_B:SCALE_A;
    const q=questions[cur];
    const dom=isB?null:DOMAINS[q.d];
    const accentColor=isB?"#BA7517":"#7F77DD";
    const accentBg=isB?"#FAEEDA":"#EEEDFE";
    const accentText=isB?"#633806":"#3C3489";
    const totalInPart=questions.length;
    const globalCur=isB?QUESTIONS_A.length+cur:cur;
    const totalQ=QUESTIONS_A.length+QUESTIONS_B.length;
    const isLast=cur===totalInPart-1;

    const handleAnswer=(i)=>{
      if(isB){const a=[...answersB];a[cur]=i;setAnswersB(a);}
      else{const a=[...answersA];a[cur]=i;setAnswersA(a);}
    };
    const handleNext=()=>{
      if(answers[cur]==null)return;
      if(isLast){
        if(isB){finish();}
        else{setPart("B_intro");}
      } else {
        setCur(c=>c+1);
      }
    };
    const handleBack=()=>{
      if(cur===0&&isB){setPart("B_intro");}
      else{setCur(c=>c-1);}
    };

    return(
      <div style={{padding:"1rem 1.5rem 80px"}}>
        <div style={{borderBottom:"0.5px solid #e2e0d8",paddingBottom:".75rem",marginBottom:"1.5rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:12,background:accentBg,color:accentText}}>
              {isB?"Part B — 過去1ヶ月":dom.name}
            </span>
            <span style={{fontSize:12,color:"#9c9a92"}}>{globalCur+1} / {totalQ}</span>
          </div>
          <div style={{height:3,background:"#e2e0d8",borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${((globalCur+1)/totalQ)*100}%`,background:accentColor,transition:"width .3s"}}/>
          </div>
        </div>
        <div style={{fontSize:16,lineHeight:1.8,marginBottom:"1.75rem",minHeight:60}}>{q.text}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:"2rem"}}>
          {scale.map((label,i)=>{
            const sel=answers[cur]===i;
            return <button key={i} onClick={()=>handleAnswer(i)} style={{padding:"12px 4px",border:sel?`1.5px solid ${accentColor}`:"0.5px solid #d4d2cb",borderRadius:10,background:sel?accentColor:"#fff",cursor:"pointer",textAlign:"center",transition:"all .12s"}}>
              <span style={{display:"block",fontSize:18,fontWeight:700,color:sel?"#fff":"#1a1917",marginBottom:4}}>{i+1}</span>
              <span style={{fontSize:11,color:sel?"rgba(255,255,255,.75)":"#73726c"}}>{label}</span>
            </button>;
          })}
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <button onClick={handleBack} disabled={cur===0&&!isB} style={{padding:"10px 20px",border:"0.5px solid #d4d2cb",borderRadius:10,background:"#fff",cursor:(cur===0&&!isB)?"default":"pointer",fontSize:13,opacity:(cur===0&&!isB)?.3:1}}>← 戻る</button>
          <button onClick={handleNext} disabled={answers[cur]==null} style={{padding:"10px 24px",border:"none",borderRadius:10,background:answers[cur]!=null?"#1a1917":"#d4d2cb",color:"#fff",cursor:answers[cur]!=null?"pointer":"default",fontSize:13,fontWeight:700}}>
            {isLast&&isB?"結果を見る →":"次へ →"}
          </button>
        </div>
      </div>
    );
  }

  // RESULT
  if(screen==="result"){
    const lastH=history[history.length-1];
    const scA=lastH?lastH.scores:calcScores(answersA,answersB).a;
    const scB=lastH?lastH.scoreB:calcScores(answersA,answersB).b;
    const prev=history.length>=2?history[history.length-2].scores:null;
    const diffs=prev?scA.map((s,i)=>Math.round((s-prev[i])*10)/10):null;
    const radarData=DOMAINS.map((d,i)=>({subject:d.short,value:scA[i],fullMark:4}));
    const STRENGTHS=[
      {d:0,min:3.2,name:"自己理解が深い",tip:"自分の特性を言葉にできる力は、職場での配慮依頼に直結します。"},
      {d:1,min:3.2,name:"自己調整力がある",tip:"状況に応じて自分のペースを整える力があります。"},
      {d:2,min:3.2,name:"支援を求められる",tip:"困ったときに声をあげられる力は就労継続の保護因子です。"},
      {d:3,min:3.2,name:"回復力がある",tip:"自分の疲れや限界に気づき回復できる力があります。"},
      {d:4,min:3.2,name:"環境適合を判断できる",tip:"自分に合う職場・仕事スタイルを見極める力があります。"},
    ];
    const WARNINGS=[
      {d:0,max:2.4,name:"自分の状態に気づきにくい",tip:"定期的なセルフチェック時間を作ることが助けになります。"},
      {d:1,max:2.4,name:"優先順位の整理が難しい",tip:"タスクの見える化や上司への優先順位確認の依頼が有効です。"},
      {d:2,max:2.4,name:"困りごとを抱え込みやすい",tip:"定期的な1on1を会社に依頼するのが効果的です。"},
      {d:2,max:2.8,name:"言い出せない気持ちがある",tip:"職場共有シートを使うと伝えやすくなります。"},
      {d:3,max:2.4,name:"限界サインを見逃しやすい",tip:"「ちょっと変だな」を感じたら早めに動く癖をつけましょう。"},
      {d:3,max:2.8,name:"カモフラージュ疲弊がある",tip:"「普通に見せる」努力が燃え尽きの主因になることがあります。"},
      {d:4,max:2.4,name:"ミスマッチを言語化しにくい",tip:"このアセスメント結果を見せながら相談するのが一つの方法です。"},
    ];
    const strs=STRENGTHS.filter(s=>scA[s.d]>=s.min);
    const warns=WARNINGS.filter(w=>scA[w.d]<=w.max);
    const shareItems=buildShare(scA);
    return(
      <div style={{padding:"1.5rem 1.5rem 0",paddingBottom:"80px"}}>
        <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
          <div style={{fontSize:21,fontWeight:700,marginBottom:4}}>あなたの特性マップ</div>
          <div style={{fontSize:13,color:"#73726c"}}>{fmtFull(new Date().toISOString())}</div>
          {diffs&&<div style={{fontSize:12,color:"#378ADD",marginTop:4}}>前回から変化あり — 変化グラフで詳しく確認できます</div>}
        </div>
        <div style={{height:240,marginBottom:"1.25rem"}}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e0d8"/>
              <PolarAngleAxis dataKey="subject" tick={{fontSize:12,fill:"#73726c"}}/>
              <Radar dataKey="value" stroke="#7F77DD" fill="#7F77DD" fillOpacity={0.15} strokeWidth={2} dot={{r:4,fill:"#7F77DD"}}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div style={{display:"grid",gap:8,marginBottom:"1rem"}}>
          {DOMAINS.map((d,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"76px 1fr auto",gap:10,alignItems:"center"}}>
              <span style={{fontSize:12,color:"#4a4845"}}>{d.name}</span>
              <div style={{height:6,background:"#e2e0d8",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${(scA[i]/4)*100}%`,background:d.color,transition:"width .5s"}}/>
              </div>
              <div style={{display:"flex",alignItems:"center",minWidth:56}}>
                <span style={{fontSize:13,fontWeight:700,color:d.color}}>{scA[i].toFixed(1)}</span>
                <Delta v={diffs?diffs[i]:null}/>
              </div>
            </div>
          ))}
        </div>
        {/* Part B: 消耗度スコア */}
        {scB>0&&(
          <div style={{padding:"1rem 1.1rem",borderRadius:12,background:scB>=3?"#FAECE7":scB>=2?"#FAEEDA":"#E1F5EE",border:`0.5px solid ${scB>=3?"#F0997B":scB>=2?"#EF9F27":"#5DCBA6"}`,marginBottom:"1.5rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{fontSize:13,fontWeight:700,color:scB>=3?"#712B13":scB>=2?"#633806":"#085041"}}>
                過去1ヶ月の消耗度（Part B）
              </div>
              <span style={{fontSize:18,fontWeight:700,color:scB>=3?"#D85A30":scB>=2?"#BA7517":"#1D9E75"}}>{scB.toFixed(1)}<span style={{fontSize:11,fontWeight:400,color:"#73726c"}}> / 4.0</span></span>
            </div>
            <div style={{height:6,background:"rgba(0,0,0,.08)",borderRadius:3,overflow:"hidden",marginBottom:8}}>
              <div style={{height:"100%",width:`${(scB/4)*100}%`,background:scB>=3?"#D85A30":scB>=2?"#BA7517":"#1D9E75",transition:"width .5s"}}/>
            </div>
            <div style={{fontSize:12,color:scB>=3?"#993C1D":scB>=2?"#854F0B":"#085041",lineHeight:1.6}}>
              {scB>=3?"今のあなたは消耗が大きい状態です。休養や負荷軽減が必要かもしれません。":scB>=2?"消耗の傾向が見られます。無理をしすぎていないか確認してみてください。":"消耗が少なく、比較的安定した状態です。"}
            </div>
          </div>
        )}
        <div style={{fontSize:11,color:"#9c9a92",letterSpacing:".07em",textTransform:"uppercase",marginBottom:".75rem"}}>強みバッジ</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:"1.5rem"}}>
          {strs.length>0?strs.map((s,i)=>(
            <div key={i} style={{padding:".875rem",borderRadius:10,background:"#FAEEDA",border:"0.5px solid #EF9F27"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#633806",marginBottom:4}}>⭐ {s.name}</div>
              <div style={{fontSize:12,color:"#854F0B",lineHeight:1.6}}>{s.tip}</div>
            </div>
          )):<div style={{gridColumn:"1/-1",padding:".875rem",borderRadius:10,background:"#f3f2ef",fontSize:13,color:"#73726c"}}>定期的に続けることで強みが見えてきます。</div>}
        </div>
        <div style={{fontSize:11,color:"#9c9a92",letterSpacing:".07em",textTransform:"uppercase",marginBottom:".75rem"}}>要注意サイン</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:"1.5rem"}}>
          {warns.length>0?warns.map((w,i)=>(
            <div key={i} style={{padding:".875rem",borderRadius:10,background:"#FAECE7",border:"0.5px solid #F0997B"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#712B13",marginBottom:4}}>⚠ {w.name}</div>
              <div style={{fontSize:12,color:"#993C1D",lineHeight:1.6}}>{w.tip}</div>
            </div>
          )):<div style={{gridColumn:"1/-1",padding:".875rem",borderRadius:10,background:"#f3f2ef",fontSize:13,color:"#73726c"}}>特に目立った要注意サインはありません。</div>}
        </div>
        <div style={{background:"#f3f2ef",borderRadius:12,padding:"1rem 1.1rem",marginBottom:"1.5rem"}}>
          <div onClick={()=>setShareOpen(o=>!o)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
            <div>
              <div style={{fontSize:14,fontWeight:700}}>職場・上司への共有シート</div>
              <div style={{fontSize:12,color:"#73726c",marginTop:3}}>任意 — 渡したい内容だけ選べます</div>
            </div>
            <span style={{color:"#73726c",transform:shareOpen?"rotate(180deg)":"none",transition:"transform .2s",fontSize:18}}>▾</span>
          </div>
          {shareOpen&&(
            <div style={{marginTop:"1rem"}}>
              {shareItems.map(s=>(
                <div key={s.id} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:"0.5px solid #e2e0d8",alignItems:"flex-start"}}>
                  <input type="checkbox" checked={!!shareChecked[s.id]} onChange={e=>setShareChecked(c=>({...c,[s.id]:e.target.checked}))} style={{marginTop:2,cursor:"pointer"}}/>
                  <div><div style={{fontSize:11,color:"#9c9a92",marginBottom:2}}>{s.label}</div><div style={{fontSize:13,color:"#4a4845",lineHeight:1.6}}>{s.text}</div></div>
                </div>
              ))}
              <button onClick={()=>{
                const text=shareItems.filter(s=>shareChecked[s.id]).map(s=>`【${s.label}】\n${s.text}`).join("\n\n");
                if(navigator.clipboard)navigator.clipboard.writeText(text).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});
              }} style={{marginTop:".75rem",display:"block",width:"100%",padding:11,border:"0.5px solid #d4d2cb",borderRadius:10,background:"#fff",fontSize:13,cursor:"pointer"}}>
                {copied?"✓ コピーしました":"チェックした項目をコピー"}
              </button>
            </div>
          )}
        </div>
        <div style={{display:"grid",gap:8,marginBottom:"1rem"}}>
          <button onClick={()=>setScreen("history")} style={{padding:12,border:"none",borderRadius:12,background:"#1a1917",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>変化グラフを見る</button>
          <button onClick={()=>setScreen("journal")} style={{padding:12,border:"0.5px solid #d4d2cb",borderRadius:12,background:"transparent",fontSize:13,color:"#4a4845",cursor:"pointer"}}>今日の日誌を書く</button>
          <button onClick={()=>setScreen("top")} style={{padding:12,border:"0.5px solid #d4d2cb",borderRadius:12,background:"transparent",fontSize:13,color:"#73726c",cursor:"pointer"}}>トップに戻る</button>
        </div>
        <NavBar screen={screen} setScreen={setScreen}/>
      </div>
    );
  }

  // JOURNAL
  if(screen==="journal")return(
    <div style={{paddingBottom:"60px"}}>
      <div style={{padding:"1.5rem 1.5rem 0"}}>
        <div style={{fontSize:20,fontWeight:700,marginBottom:4}}>今日の日誌</div>
        <div style={{fontSize:13,color:"#73726c",marginBottom:"1.5rem"}}>短くでいいです。書き続けることが大切。</div>
        <div style={{background:"#fff",border:"0.5px solid #e2e0d8",borderRadius:12,padding:"1rem 1.1rem",marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>今日の状態</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
            {MOOD_ICONS.map((icon,i)=>(
              <button key={i} onClick={()=>setJMood(i)} style={{padding:"10px 2px",borderRadius:10,border:jMood===i?`2px solid ${MOOD_COLORS[i]}`:"0.5px solid #e2e0d8",background:jMood===i?MOOD_COLORS[i]+"18":"#fff",cursor:"pointer",textAlign:"center"}}>
                <div style={{fontSize:20,marginBottom:2}}>{icon}</div>
                <div style={{fontSize:9,color:jMood===i?MOOD_COLORS[i]:"#9c9a92",lineHeight:1.3}}>{MOOD_LABELS[i]}</div>
              </button>
            ))}
          </div>
        </div>
        <div style={{background:"#fff",border:"0.5px solid #e2e0d8",borderRadius:12,padding:"1rem 1.1rem",marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>関係している場面（複数選沢可）</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {CATEGORIES.map(c=>(
              <button key={c.id} onClick={()=>toggleCat(c.id)} style={{padding:"6px 12px",borderRadius:20,fontSize:12,fontWeight:500,border:jCats.includes(c.id)?`1.5px solid ${c.text}`:"0.5px solid #d4d2cb",background:jCats.includes(c.id)?c.color:"#fff",color:jCats.includes(c.id)?c.text:"#73726c",cursor:"pointer",transition:"all .12s"}}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{background:"#fff",border:"0.5px solid #e2e0d8",borderRadius:12,padding:"1rem 1.1rem",marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>何があった？</div>
          <textarea value={jWhat} onChange={e=>setJWhat(e.target.value)} placeholder="今日起きたこと、気になったこと…（1～2行でOK）" style={{width:"100%",minHeight:70,border:"none",background:"#fafaf8",borderRadius:8,padding:".75rem",fontSize:13,color:"#1a1917",resize:"none",outline:"none",lineHeight:1.7,boxSizing:"border-box"}}/>
        </div>
        <div style={{background:"#fff",border:"0.5px solid #e2e0d8",borderRadius:12,padding:"1rem 1.1rem",marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>そのとき自分はどう感じた・考えた？</div>
          <textarea value={jFeel} onChange={e=>setJFeel(e.target.value)} placeholder="感情・頭の中にあったこと…" style={{width:"100%",minHeight:70,border:"none",background:"#fafaf8",borderRadius:8,padding:".75rem",fontSize:13,color:"#1a1917",resize:"none",outline:"none",lineHeight:1.7,boxSizing:"border-box"}}/>
        </div>
        <div style={{background:"#fff",border:"0.5px solid #e2e0d8",borderRadius:12,padding:"1rem 1.1rem",marginBottom:"1.25rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:13,fontWeight:700}}>気づき・次に試せそうなこと</div>
            <span style={{fontSize:11,color:"#9c9a92"}}>任意</span>
          </div>
          <textarea value={jNext} onChange={e=>setJNext(e.target.value)} placeholder="「次はこうしてみよう」「こういうパターンかも」など…" style={{width:"100%",minHeight:60,border:"none",background:"#fafaf8",borderRadius:8,padding:".75rem",fontSize:13,color:"#1a1917",resize:"none",outline:"none",lineHeight:1.7,boxSizing:"border-box"}}/>
        </div>
        <button onClick={submitJ} disabled={!jWhat.trim()&&!jFeel.trim()} style={{display:"block",width:"100%",padding:14,background:jWhat.trim()||jFeel.trim()?"#1a1917":"#d4d2cb",color:"#fff",border:"none",borderRadius:12,fontSize:15,fontWeight:700,cursor:jWhat.trim()||jFeel.trim()?"pointer":"default",marginBottom:12}}>
          {jSaved?"✓ 保存しました":"保存する"}
        </button>
        <ReminderSetting/>
        {journal.length>0&&(
          <>
            <div style={{fontSize:11,color:"#9c9a92",letterSpacing:".07em",textTransform:"uppercase",margin:"1.5rem 0 .875rem"}}>過去の日誌</div>
            <div style={{display:"grid",gap:10,marginBottom:"1rem"}}>
              {journal.slice(0,10).map(j=>{
                const cat=CATEGORIES.filter(c=>j.categories?.includes(c.id));
                return(
                  <div key={j.id} style={{background:"#fff",border:"0.5px solid #e2e0d8",borderRadius:12,padding:"1rem 1.1rem"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:20}}>{MOOD_ICONS[j.mood??2]}</span>
                        <div>
                          <div style={{fontSize:13,fontWeight:700}}>{fmtFull(j.date)}</div>
                          <div style={{fontSize:11,color:"#9c9a92"}}>{MOOD_LABELS[j.mood??2]}</div>
                        </div>
                      </div>
                      <button onClick={()=>saveJ(journal.filter(x=>x.id!==j.id))} style={{fontSize:11,color:"#9c9a92",background:"none",border:"0.5px solid #e2e0d8",borderRadius:6,padding:"3px 8px",cursor:"pointer"}}>削除</button>
                    </div>
                    {cat.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>{cat.map(c=><span key={c.id} style={{fontSize:11,padding:"2px 8px",borderRadius:10,background:c.color,color:c.text}}>{c.label}</span>)}</div>}
                    {j.what&&<div style={{fontSize:13,color:"#1a1917",lineHeight:1.6,marginBottom:4}}><span style={{fontSize:11,color:"#9c9a92"}}>何があった：</span>{j.what}</div>}
                    {j.feel&&<div style={{fontSize:13,color:"#4a4845",lineHeight:1.6,marginBottom:4}}><span style={{fontSize:11,color:"#9c9a92"}}>感じた・思った：</span>{j.feel}</div>}
                    {j.next&&<div style={{fontSize:13,color:"#378ADD",lineHeight:1.6}}><span style={{fontSize:11,color:"#9c9a92"}}>気づき：</span>{j.next}</div>}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      <NavBar screen={screen} setScreen={setScreen}/>
    </div>
  );

  // HISTORY
  return(
    <div style={{paddingBottom:"60px"}}>
      <div style={{padding:"1.5rem 1.5rem 0"}}>
        <div style={{fontSize:20,fontWeight:700,marginBottom:4}}>変化を振り返る</div>
        <div style={{fontSize:13,color:"#73726c",marginBottom:"1.5rem",marginTop:2}}>全{history.length}回の記録</div>
        {history.length<2?(
          <div style={{padding:"2rem",textAlign:"center",background:"#f3f2ef",borderRadius:12,marginBottom:"1rem"}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:8}}>まだ記録が少ないです</div>
            <div style={{fontSize:13,color:"#73726c",lineHeight:1.7}}>2回以上アセスメントを行うと<br/>変化グラフが表示されます</div>
            <div style={{fontSize:12,color:"#9c9a92",marginTop:12}}>目安：3ヶ月ごとに繰り返すと変化が見えてきます</div>
            <button onClick={startQuiz} style={{marginTop:16,padding:"10px 24px",background:"#1a1917",color:"#fff",border:"none",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer"}}>今すぐアセスメントを受ける</button>
          </div>
        ):(
          <>
            <div style={{fontSize:11,color:"#9c9a92",letterSpacing:".07em",textTransform:"uppercase",marginBottom:".75rem"}}>5領域の推移</div>
            <div style={{height:220,background:"#f3f2ef",borderRadius:12,padding:"1rem .5rem 1rem 0",marginBottom:"1.5rem"}}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <XAxis dataKey="name" tick={{fontSize:11}}/>
                  <YAxis domain={[1,4]} tick={{fontSize:11}} width={24} ticks={[1,2,3,4]}/>
                  <Tooltip formatter={(v,n)=>[parseFloat(v).toFixed(1),n]} labelFormatter={l=>lineData.find(d=>d.name===l)?.full||l}/>
                  <Legend wrapperStyle={{fontSize:11}}/>
                  {DOMAINS.map(d=><Line key={d.id} type="monotone" dataKey={d.short} stroke={d.color} strokeWidth={2} dot={{r:3,fill:d.color}} activeDot={{r:5}}/>)}
                </LineChart>
              </ResponsiveContainer>
            </div>
            {(()=>{
              const last=history[history.length-1],prev=history[history.length-2];
              const diffs=last.scores.map((s,i)=>Math.round((s-prev.scores[i])*10)/10);
              const up=DOMAINS.filter((_,i)=>diffs[i]>0.2),dn=DOMAINS.filter((_,i)=>diffs[i]<-0.2);
              return(
                <div style={{background:"#fff",border:"0.5px solid #e2e0d8",borderRadius:12,padding:"1rem 1.1rem",marginBottom:"1.5rem"}}>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>前回（{fmtFull(prev.date)}）との比較</div>
                  {up.length>0&&<div style={{marginBottom:8}}><span style={{fontSize:12,padding:"2px 8px",borderRadius:10,background:"#E1F5EE",color:"#085041"}}>上がった領域</span><span style={{fontSize:13,color:"#1D9E75",marginLeft:8}}>{up.map(d=>d.name).join("・")}</span></div>}
                  {dn.length>0&&<div style={{marginBottom:8}}><span style={{fontSize:12,padding:"2px 8px",borderRadius:10,background:"#FAECE7",color:"#712B13"}}>下がった領域</span><span style={{fontSize:13,color:"#D85A30",marginLeft:8}}>{dn.map(d=>d.name).join("・")}</span></div>}
                  {up.length===0&&dn.length===0&&<div style={{fontSize:13,color:"#73726c"}}>大きな変化はありませんでした。安定しています。</div>}
                </div>
              );
            })()}
            <div style={{fontSize:11,color:"#9c9a92",letterSpacing:".07em",textTransform:"uppercase",marginBottom:".75rem"}}>記録一覧</div>
            <div style={{display:"grid",gap:8,marginBottom:"1rem"}}>
              {[...history].reverse().map((h,ri)=>{
                const idx=history.length-1-ri,ph=idx>0?history[idx-1]:null;
                return(
                  <div key={idx} style={{background:"#fff",border:"0.5px solid #e2e0d8",borderRadius:12,padding:"1rem 1.1rem"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <div><div style={{fontSize:14,fontWeight:700}}>{fmtFull(h.date)}</div><div style={{fontSize:11,color:"#9c9a92"}}>第{idx+1}回</div></div>
                      <button onClick={()=>save(history.filter((_,i)=>i!==idx))} style={{fontSize:11,color:"#9c9a92",background:"none",border:"0.5px solid #e2e0d8",borderRadius:6,padding:"3px 8px",cursor:"pointer"}}>削除</button>
                    </div>
                    <div style={{display:"grid",gap:6}}>
                      {DOMAINS.map((d,i)=>{
                        const delta=ph?Math.round((h.scores[i]-ph.scores[i])*10)/10:null;
                        return(
                          <div key={i} style={{display:"grid",gridTemplateColumns:"72px 1fr auto",gap:8,alignItems:"center"}}>
                            <span style={{fontSize:12,color:"#4a4845"}}>{d.name}</span>
                            <div style={{height:5,background:"#e2e0d8",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${(h.scores[i]/4)*100}%`,background:d.color}}/></div>
                            <div style={{display:"flex",alignItems:"center"}}><span style={{fontSize:12,fontWeight:700,color:d.color,minWidth:24}}>{h.scores[i].toFixed(1)}</span><Delta v={delta}/></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        <button onClick={startQuiz} style={{display:"block",width:"100%",padding:13,background:"#1a1917",color:"#fff",border:"none",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:"1rem"}}>今日もアセスメントを受ける</button>
      </div>
      <NavBar screen={screen} setScreen={setScreen}/>
    </div>
  );
}

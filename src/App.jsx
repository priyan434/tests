import React, { useEffect, useRef, useState } from 'react';

const App = () => {
  const [time,setTime]=useState({hr:"",mm:"",ss:""})
  const intervalRef=useRef()
  const [isRunning,setIsRunning]=useState(false)

useEffect(()=>{
  intervalRef.current=setInterval(() => {
    setTime((prevTime)=>{
      let {hr,mm,ss}=prevTime
      if(ss>0){
        ss-=1
      }
      else if(mm>0){
        mm-=1
        ss=59
      }
      else if(hr>0){
        hr-=1
        mm=59
        ss=59
      }
      else{
        clearInterval(intervalRef)
        setIsRunning(false)
      }
      return {hr,mm,ss}
    })

  }, 1000);
  return ()=>clearInterval(intervalRef.current)
  
},[isRunning])




const handleChange=(e)=>{
  const {name,value}=e.target
  if(name=="hr")setTime({...time,[name]:value})
  if(name=="mm")setTime({...time,[name]:value})
  if(name=="ss")setTime({...time,[name]:value})
}

const normalizetime=({hr,mm,ss})=>{

hr+=Math.floor(mm/60)

mm=mm%60

mm+=Math.floor(ss/60)
ss=ss%60
return {hr,mm,ss}
}
const start = () => {
  const normalizedTime = normalizetime(time);
  if (normalizedTime.hr === 0 && normalizedTime.mm === 0 && normalizedTime.ss === 0) {
    return;
  }
  setTime(normalizedTime);
  setIsRunning(true);
};
const stop=()=>{
  // setTime({hr:'',mm:'',ss:''})
  clearInterval(intervalRef.current)
  setIsRunning(false)
}
const clearTimer=()=>{
  setTime({hr:"",ss:"",mm:""})
  clearInterval(intervalRef.current)
  setIsRunning(false)
}
  return (
    <div>
    <input type="number" name="hr" id="" value={time.hr}  onChange={handleChange} className='border-2'  />  
    <input type="number" name="mm" id="" value={time.mm}  onChange={handleChange}   className='border-2'/>  
    <input type="number" name="ss" id="" value={time.ss}  onChange={handleChange}  className='border-2' />  
    <button  onClick={start} >start</button>
    <button onClick={stop} >stop</button>
    <button onClick={clearTimer} >clear</button>
    </div>

  );
}

export default App;

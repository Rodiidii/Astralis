export function canScheduleTetrisDrop({mounted=true,hidden=false,mode='tetris',paused=false,ended=false}={}){
 return mounted===true&&hidden!==true&&mode==='tetris'&&paused!==true&&ended!==true;
}

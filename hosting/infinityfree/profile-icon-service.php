<?php
declare(strict_types=1);
function profile_icon_service(string $route,string $method,string $root): void {
    $dir=astralis_private_store($root,'profile-icons');
    $id=(string)($_GET['id']??'');
    if (preg_match('#^profile-icon/([a-f0-9]{64})\.png$#D',$route,$pathMatch)) $id=$pathMatch[1];
    if ($method==='GET' && preg_match('/^[a-f0-9]{64}$/D',$id) && is_file($dir.'/'.$id.'.png')) {
        if ($route==='profile-icon/manifest') reply(200,['id'=>'/','name'=>'Astralis','short_name'=>'Astralis','start_url'=>'/?profile-icon='.$id,'scope'=>'/','display'=>'standalone','background_color'=>'#111b27','theme_color'=>'#111b27','icons'=>[['src'=>'/api/profile-icon?id='.$id,'sizes'=>'512x512','type'=>'image/png','purpose'=>'any']]]);
        if ($route==='profile-icon/install') {
            header('Content-Type: text/html; charset=utf-8');header('Cache-Control: no-store');
            echo str_replace('{{ICON_ID}}',$id,file_get_contents(__DIR__.'/profile-install.html'));exit;
        }
        header('Content-Type: image/png');header('X-Content-Type-Options: nosniff');header('Cache-Control: public, max-age=31536000, immutable');readfile($dir.'/'.$id.'.png');exit;
    }
    if ($method!=='POST' || $route!=='profile-icon') reply(404,['error'=>'Icône introuvable.']);
    $origin=(string)($_SERVER['HTTP_ORIGIN']??'');
    if ($origin!=='') {
        $source=parse_url($origin);$host=parse_url('http://'.($_SERVER['HTTP_HOST']??''));
        if (!is_array($source) || !is_array($host) || !in_array($source['scheme']??'',['http','https'],true) || strtolower($source['host']??'')!==strtolower($host['host']??'') || ($source['port']??(($source['scheme']??'')==='https'?443:80))!==($host['port']??(($source['scheme']??'')==='https'?443:80))) reply(403,['error'=>'Origine refusée.']);
    }
    if ((int)($_SERVER['CONTENT_LENGTH']??0)>900000) reply(413,['error'=>'Icône trop volumineuse.']);
    $body=json_decode(file_get_contents('php://input'),true);$image=(string)($body['image']??'');
    if (!preg_match('#^data:image/png;base64,([A-Za-z0-9+/=]+)$#D',$image,$match)) reply(400,['error'=>'Une icône PNG est nécessaire.']);
    $bytes=base64_decode($match[1],true);$info=$bytes!==false?@getimagesizefromstring($bytes):false;
    if (!$info || strlen($bytes)>650000 || $info[0]!==512 || $info[1]!==512 || $info['mime']!=='image/png') reply(400,['error'=>'L’icône doit mesurer 512 × 512 pixels.']);
    $id=hash('sha256',$bytes);$file=$dir.'/'.$id.'.png';
    if (!is_file($file)) {
        $rate=$dir.'/rate-'.hash('sha256',(string)($_SERVER['REMOTE_ADDR']??'')).'.json';$handle=@fopen($rate,'c+');if (!$handle || !flock($handle,LOCK_EX)) reply(503,['error'=>'Réessaie plus tard.']);
        $times=json_decode(stream_get_contents($handle),true);$times=is_array($times)?array_values(array_filter($times,fn($t)=>$t>time()-3600)):[];
        if (count($times)>=12) {flock($handle,LOCK_UN);fclose($handle);reply(429,['error'=>'Trop de changements d’icône. Réessaie dans une heure.']);}
        if (file_put_contents($file,$bytes,LOCK_EX)===false) reply(503,['error'=>'Icône non enregistrée.']);
        $times[]=time();rewind($handle);ftruncate($handle,0);fwrite($handle,json_encode($times));flock($handle,LOCK_UN);fclose($handle);
    }
    reply(200,['ok'=>true,'iconUrl'=>'/api/profile-icon?id='.$id,'manifestUrl'=>'/api/profile-icon/manifest?id='.$id,'installUrl'=>'/api/profile-icon/install?id='.$id]);
}

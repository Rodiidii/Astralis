<?php
declare(strict_types=1);
function profile_icon_service(string $route,string $method,string $root): void {
    $dir=dirname($root).'/.astralis-profile-icons';
    if (!is_dir($dir) && !@mkdir($dir,0700,true)) reply(503,['error'=>'Les icônes de profil sont indisponibles.']);
    $id=(string)($_GET['id']??'');
    if ($method==='GET' && preg_match('/^[a-f0-9]{64}$/D',$id) && is_file($dir.'/'.$id.'.png')) {
        if ($route==='profile-icon/manifest') reply(200,['id'=>'/','name'=>'Astralis','short_name'=>'Astralis','start_url'=>'/?profile-icon='.$id,'scope'=>'/','display'=>'standalone','background_color'=>'#111b27','theme_color'=>'#111b27','icons'=>[['src'=>'/api/profile-icon?id='.$id,'sizes'=>'512x512','type'=>'image/png','purpose'=>'any']]]);
        header('Content-Type: image/png');header('Cache-Control: public, max-age=31536000, immutable');readfile($dir.'/'.$id.'.png');exit;
    }
    if ($method!=='POST' || $route!=='profile-icon') reply(404,['error'=>'Icône introuvable.']);
    $origin=(string)($_SERVER['HTTP_ORIGIN']??'');if ($origin!=='' && parse_url($origin,PHP_URL_HOST)!==($_SERVER['HTTP_HOST']??'')) reply(403,['error'=>'Origine refusée.']);
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
    reply(200,['ok'=>true,'iconUrl'=>'/api/profile-icon?id='.$id,'manifestUrl'=>'/api/profile-icon/manifest?id='.$id]);
}

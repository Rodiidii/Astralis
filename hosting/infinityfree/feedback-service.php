<?php
declare(strict_types=1);
// Only this service accepts public reports. Reports and attachments are never public files.
function feedback_service(string $route, string $method, string $root): void {
    $ownerFile=__DIR__.'/owner.php';
    $owner=is_file($ownerFile)?require $ownerFile:[];
    $ownerHash=(string)($owner['feedback_hash']??'');
    if ($ownerHash==='') reply(503,['error'=>'La boîte de réception n’est pas encore configurée.']);
    $directory=astralis_private_store($root,'feedback');
    ini_set('session.use_strict_mode','1');
    session_name('astralis_creator');
    session_set_cookie_params(['lifetime'=>43200,'path'=>'/','secure'=>!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']!=='off','httponly'=>true,'samesite'=>'Strict']);
    session_start();
    $admin=!empty($_SESSION['feedback_admin']) && (int)($_SESSION['feedback_until']??0)>time();
    $origin=(string)($_SERVER['HTTP_ORIGIN']??'');
    if ($method!=='GET' && $origin!=='' && parse_url($origin,PHP_URL_HOST)!==($_SERVER['HTTP_HOST']??'')) reply(403,['error'=>'Origine refusée.']);
    $ipHash=hash_hmac('sha256',(string)($_SERVER['REMOTE_ADDR']??'unknown'),$ownerHash);
    $body=[];
    if ($method==='POST') {
        $length=(int)($_SERVER['CONTENT_LENGTH']??0);
        if ($length<2 || $length>2400000) reply(413,['error'=>'Le message ou son image est trop volumineux.']);
        $body=json_decode(file_get_contents('php://input'),true);
        if (!is_array($body)) reply(400,['error'=>'Message invalide.']);
    }
    if ($route==='feedback/status') {
        $count=0;if($admin)foreach(glob($directory.'/report-*.json')?:[] as $file){$row=json_decode((string)file_get_contents($file),true);if(($row['status']??'')==='new')$count++;}
        reply(200,['ok'=>true,'authenticated'=>$admin,'private'=>true,'newCount'=>$admin?$count:0]);
    }
    if ($route==='feedback/login' && $method==='POST') {
        $file=$directory.'/login-'.$ipHash.'.json';
        $attempts=is_file($file)?json_decode((string)file_get_contents($file),true):[];
        $attempts=is_array($attempts)?array_values(array_filter($attempts,fn($t)=>$t>time()-600)):[];
        if (count($attempts)>=6) reply(429,['error'=>'Réessaie dans dix minutes.']);
        if (!hash_equals($ownerHash,hash('sha256',(string)($body['key']??'')))) {
            $attempts[]=time();file_put_contents($file,json_encode($attempts),LOCK_EX);reply(401,['error'=>'Accès créateur incorrect.']);
        }
        session_regenerate_id(true);$_SESSION['feedback_admin']=true;$_SESSION['feedback_until']=time()+43200;
        if (is_file($file)) unlink($file);
        reply(200,['ok'=>true,'authenticated'=>true]);
    }
    if ($route==='feedback/logout' && $method==='POST') {$_SESSION=[];session_destroy();reply(200,['ok'=>true]);}
    if ($route==='feedback' && $method==='POST') {
        if (!empty($body['website'])) reply(400,['error'=>'Message refusé.']);
        $kind=(string)($body['kind']??'bug');$category=(string)($body['category']??'other');
        if (!in_array($kind,['bug','idea'],true)||!in_array($category,['calculation','display','data','performance','other'],true)) reply(400,['error'=>'Catégorie invalide.']);
        $title=trim((string)($body['title']??''));$description=trim((string)($body['description']??''));
        if (strlen($title)<4 || strlen($title)>640 || strlen($description)<15 || strlen($description)>32000) reply(400,['error'=>'Ajoute un titre (4–160 caractères) et une description (15–8 000 caractères).']);
        $rateFile=$directory.'/rate-'.$ipHash.'.json';$rate=@fopen($rateFile,'c+');
        if (!$rate || !flock($rate,LOCK_EX)) reply(503,['error'=>'Réessaie dans un instant.']);
        $times=json_decode(stream_get_contents($rate),true);$times=is_array($times)?array_values(array_filter($times,fn($t)=>$t>time()-600)):[];
        if (count($times)>=5) {flock($rate,LOCK_UN);fclose($rate);reply(429,['error'=>'Cinq retours maximum en dix minutes. Réessaie plus tard.']);}
        $image=null;$imageValue=(string)($body['image']??'');
        if ($imageValue!=='') {
            if (!preg_match('#^data:image/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$#D',$imageValue,$parts)) reply(400,['error'=>'Choisis une image PNG, JPEG ou WebP.']);
            $bytes=base64_decode($parts[2],true);$info=$bytes!==false?@getimagesizefromstring($bytes):false;
            if ($bytes===false || strlen($bytes)>1500000 || !$info || $info[0]>4096 || $info[1]>4096 || !in_array($info['mime'],['image/png','image/jpeg','image/webp'],true)) reply(400,['error'=>'Image invalide ou trop grande (1,5 Mo, 4 096 px maximum).']);
            $image='data:'.$info['mime'].';base64,'.base64_encode($bytes);
        }
        $id=bin2hex(random_bytes(12));
        $record=['id'=>$id,'createdAt'=>gmdate('c'),'status'=>'new','kind'=>$kind,'category'=>$category,'title'=>$title,'description'=>$description,'steps'=>substr((string)($body['steps']??''),0,16000),'contact'=>substr((string)($body['contact']??''),0,640),'platform'=>in_array($body['platform']??'', ['app','site'],true)?$body['platform']:'site','page'=>substr((string)($body['page']??''),0,400),'version'=>substr((string)($body['version']??''),0,100),'image'=>$image];
        $record['hasImage']=$image!==null;unset($record['image']);
        if($image!==null && file_put_contents($directory.'/image-'.$id.'.txt',$image,LOCK_EX)===false)reply(503,['error'=>'La capture n’a pas pu être enregistrée.']);
        $encoded=json_encode($record,JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE);
        if (file_put_contents($directory.'/report-'.$id.'.json',$encoded,LOCK_EX)===false) reply(503,['error'=>'Le message n’a pas été enregistré. Réessaie.']);
        $times[]=time();rewind($rate);ftruncate($rate,0);fwrite($rate,json_encode($times));flock($rate,LOCK_UN);fclose($rate);
        reply(201,['ok'=>true,'id'=>$id,'message'=>'Ton retour a été transmis au créateur.']);
    }
    if (!$admin) reply(403,['error'=>'Cette boîte de réception est réservée au créateur.']);
    if ($route==='feedback/inbox' && $method==='GET') {
        $rows=[];
        foreach (glob($directory.'/report-*.json')?:[] as $file) {$row=json_decode((string)file_get_contents($file),true);if (is_array($row)) {unset($row['image']);$row['hasImage']=!empty($row['hasImage']);$rows[]=$row;}}
        usort($rows,fn($a,$b)=>strcmp($b['createdAt'],$a['createdAt']));reply(200,['ok'=>true,'reports'=>$rows]);
    }
    $id=(string)($_GET['id']??$body['id']??'');
    if (!preg_match('/^[a-f0-9]{24}$/D',$id)) reply(400,['error'=>'Identifiant invalide.']);
    $file=$directory.'/report-'.$id.'.json';
    if (!is_file($file)) reply(404,['error'=>'Retour introuvable.']);
    $record=json_decode((string)file_get_contents($file),true);
    if ($route==='feedback/item' && $method==='GET') {$record['image']=!empty($record['hasImage'])?(string)@file_get_contents($directory.'/image-'.$id.'.txt'):null;reply(200,['ok'=>true,'report'=>$record]);}
    if ($route==='feedback/update' && $method==='POST') {
        $status=(string)($body['status']??'');
        if (!in_array($status,['new','reading','resolved','archived'],true)) reply(400,['error'=>'Statut invalide.']);
        $record['status']=$status;file_put_contents($file,json_encode($record,JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE),LOCK_EX);reply(200,['ok'=>true]);
    }
    if ($route==='feedback/delete' && $method==='POST') {unlink($file);if(is_file($directory.'/image-'.$id.'.txt'))unlink($directory.'/image-'.$id.'.txt');reply(200,['ok'=>true]);}
    reply(404,['error'=>'Route inconnue.']);
}

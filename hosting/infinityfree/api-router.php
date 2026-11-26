<?php
declare(strict_types=1);
// Read-only web edition. Never forward account credentials or desktop commands.
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
$root = dirname(__DIR__);
$path = (string)parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$route = preg_replace('#^/api/#', '', $path);
$configFile = __DIR__ . '/config.php';
$config = is_file($configFile) ? require $configFile : [];
function reply(int $status, $data) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
function remote_json(string $url): ?array {
    if (!function_exists('curl_init')) return null;
    $curl = curl_init($url);
    curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER=>true, CURLOPT_FOLLOWLOCATION=>false, CURLOPT_CONNECTTIMEOUT=>7, CURLOPT_TIMEOUT=>20, CURLOPT_USERAGENT=>'Astralis-Web/1.0.58', CURLOPT_SSL_VERIFYPEER=>true, CURLOPT_PROTOCOLS=>CURLPROTO_HTTPS, CURLOPT_HTTPHEADER=>['Accept: application/json']]);
    $body = curl_exec($curl); $status = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE); curl_close($curl);
    if (!is_string($body) || strlen($body)>16*1024*1024 || $status!==200) return null;
    $data = json_decode($body, true);
    return is_array($data) ? $data : null;
}
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if (!in_array($method, ['GET','HEAD'], true)) reply(403, ['ok'=>false,'readOnly'=>true,'error'=>'Cette édition web est en lecture seule pour les publications et les opérations du serveur.']);
if ($route==='character-sheets/status') reply(200, ['ok'=>true,'readOnly'=>true,'adminConfigured'=>false,'authenticated'=>false,'localAdmin'=>false,'publishReady'=>false,'storage'=>'Édition web publique']);
if ($route==='character-sheets/index') {
    $file=$root.'/published/character-sheets/index.json';
    $data=is_file($file)?json_decode(file_get_contents($file),true):null;
    $data=remote_json('https://raw.githubusercontent.com/Rodiidii/Astralis/main/published/character-sheets/index.json') ?? $data;
    reply(200, is_array($data)?$data:['sheets'=>[]]);
}
if ($route==='character-sheets/item') {
    $id=(string)($_GET['id']??'');
    if (!preg_match('/^[a-zA-Z0-9_-]{1,120}$/D',$id)) reply(400,['error'=>'Identifiant de fiche invalide.']);
    $file=$root.'/published/character-sheets/'.$id.'.json';
    $data=is_file($file)?json_decode(file_get_contents($file),true):null;
    $data=remote_json('https://raw.githubusercontent.com/Rodiidii/Astralis/main/published/character-sheets/'.rawurlencode($id).'.json') ?? $data;
    if (!is_array($data)) reply(404,['error'=>'Cette fiche n’est pas publiée dans le catalogue web.']);
    reply(200,isset($data['sheet'])?$data:['sheet'=>$data]);
}
if (strpos($route,'update/')===0) reply(200,['available'=>false,'supported'=>false,'hosted'=>true,'currentVersion'=>'1.0.58','message'=>'Les mises à jour du programme Windows se font dans l’application installée.']);
if (strpos($route,'desktop/')===0) reply(200,['ok'=>true,'supported'=>false,'hosted'=>true,'settings'=>[]]);
$allowed=['gi/news','gi/events','gi/endgame','gi/lore','gi/lore-index','gi/lore-video-list','gi/character-media','gi/character-stories','gi/character-voice','gi/character-voices','gi/region-lore','gi/relations','game-codes'];
if (in_array($route,$allowed,true)) {
    $upstream=rtrim((string)($config['api_origin']??''),'/');
    $parsed=parse_url($upstream);
    if ($upstream!=='' && is_array($parsed) && ($parsed['scheme']??'')==='https' && !isset($parsed['user']) && !isset($parsed['pass']) && !isset($parsed['query']) && !isset($parsed['fragment'])) {
        $query=$_SERVER['QUERY_STRING']??'';
        $data=remote_json($upstream.'/api/'.$route.($query!==''?'?'.$query:''));
        if ($data!==null) reply(200,$data);
    }
    $file=$root.'/hosting-data/'.str_replace('/','-',$route).'.json';
    if (is_file($file)) {$data=json_decode(file_get_contents($file),true);if(is_array($data))reply(200,$data);}
    reply(503,['error'=>'Ce flux en direct demande le serveur de données Astralis. Son adresse peut être renseignée dans api/config.php.','backendRequired'=>true,'platform'=>'infinityfree']);
}
reply(404,['error'=>'Service non disponible dans cette édition web.','platform'=>'infinityfree']);

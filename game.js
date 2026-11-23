const cardData={
  hikari:{name:'ii⑪彷徨亡き光り',kind:'光属性 / 効果',level:4,atk:1950,def:100,rune:'✧',description:'このカードは戦闘では破壊されない。戦闘を行った相手モンスターのコントロールを得る。この効果を発動するまで、ATKが1100アップする。',effect:'不滅の光：戦闘相手を奪取。発動前 ATK +1100'},
  sentinel:{name:'祭壇の守護者',kind:'地属性 / 効果',level:4,atk:1700,def:1600,rune:'◈',description:'祭壇を守る古き番人。静かな意志で戦線を支える。',effect:'守護の構え'},
  wisp:{name:'薄明のウィスプ',kind:'風属性 / 効果',level:3,atk:1200,def:900,rune:'☼',description:'薄明の祭壇に棲む小さな光霊。',effect:'小さな光霊'},
  oracle:{name:'星詠みの巫女',kind:'闇属性 / 効果',level:4,atk:1500,def:1300,rune:'☾',description:'星の囁きを読み、次の運命を告げる。',effect:'星詠み'},
  spell:{name:'聖域の共鳴',kind:'魔法カード',level:0,rune:'⌁',description:'祭壇に響く祈り。自分のLPを600回復する。',effect:'自分のLPを600回復'},
  guardian:{name:'黄昏の竜騎士',kind:'光属性 / 効果',level:5,atk:2100,def:1800,rune:'♢',description:'夕映えを纏う竜騎士。',effect:'黄昏の一閃'},
  shadow:{name:'影縫いの魔術師',kind:'闇属性 / 効果',level:4,atk:1600,def:1200,rune:'◉',description:'影を縫い止め、敵の歩みを鈍らせる。',effect:'影縫い'}
};
const $=id=>document.getElementById(id);
const playerMonsters=Array(6).fill(null),enemyMonsters=Array(6).fill(null);
const playerSpells=Array(4).fill(null),enemySpells=Array(4).fill(null);
let selected=null,soundOn=true;

function toast(text){const el=$('toast');el.textContent=text;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2600)}
function renderRooms(){$('roomList').innerHTML='<p class="empty-state">オンラインサーバーに接続すると、利用可能なルームが表示されます。</p>'}
function buildZones(){for(const [id,type,count] of [['enemyZones','enemy',6],['playerZones','player',6]]){$(id).innerHTML=Array.from({length:count},(_,i)=>`<button class="zone monster-zone" data-side="${type}" data-index="${i}" aria-label="${type==='player'?'自分':'相手'} モンスターゾーン ${i+1}" disabled><span class="zone-label">MONSTER</span></button>`).join('')}}
function renderZoneSet(container,arr,side){[...$(container).children].forEach((el,i)=>{const card=arr[i];el.classList.toggle('occupied',!!card);el.innerHTML=card?`<div class="zone-card"><span class="mini-rune">${cardData[card.id].rune}</span><b>${cardData[card.id].name}</b></div>`:'<span class="zone-label">MONSTER</span>';el.disabled=true;el.setAttribute('aria-label',`${side} モンスターゾーン ${i+1}`)})}
function renderSpells(){for(const [side,arr] of [['player',playerSpells],['enemy',enemySpells]]){let host=$(side==='player'?'playerSpellZones':'enemySpellZones');if(!host){host=document.createElement('div');host.id=side==='player'?'playerSpellZones':'enemySpellZones';host.className=`zones ${side}-spell-zones`;$(side==='player'?'playerZones':'enemyZones').after(host);host.innerHTML=Array.from({length:4},()=>'<button class="zone spell-zone" disabled><span class="zone-label">SPELL</span></button>').join('')}Array.from(host.children).forEach((el,i)=>{const card=arr[i];el.innerHTML=card?`<div class="zone-card"><span class="mini-rune">${cardData[card.id].rune}</span><b>${cardData[card.id].name}</b></div>`:'<span class="zone-label">SPELL</span>';el.disabled=true})}}
function render(){renderZoneSet('playerZones',playerMonsters,'自分');renderZoneSet('enemyZones',enemyMonsters,'相手');renderSpells();$('playerLP').textContent='—';$('enemyLP').textContent='—';$('playerBar').style.width='0%';$('enemyBar').style.width='0%';$('graveCount').textContent='—';$('deckCount').textContent='—';$('banishedCount').textContent='—';$('turnNumber').textContent='—';$('turnLabel').textContent='サーバー接続待ち';$('phaseLabel').textContent='ONLINE ONLY';$('enemyHand').innerHTML='';$('handCards').innerHTML='<p class="empty-state">オンライン決闘に接続すると手札が表示されます。</p>';$('handCount').textContent='—';$('selectedLabel').textContent='オンラインサーバー接続待ち';for(const id of ['summonButton','setButton','attackButton','passButton','deckButton','graveButton'])$(id).disabled=true}
function showCard(card){const detail=$('cardDetail');detail.className='card-detail empty-detail';detail.innerHTML=card?`<div class="empty-rune">${cardData[card.id]?.rune||'✧'}</div><b>${cardData[card.id]?.name||'カード'}</b><p>${cardData[card.id]?.description||''}</p>`:'<div class="empty-rune">✧</div><b>カードを選択</b><p>オンライン決闘に接続するとカード情報が表示されます。</p>'}
function appendChat(name,text,system=false){const el=document.createElement('div');el.className=`chat-message ${system?'system':''}`;const meta=document.createElement('div');meta.className='chat-meta';meta.innerHTML=`<span>${system?'✧':'●'}</span><b>${escapeHtml(name)}</b>`;const message=document.createElement('p');message.textContent=text;el.append(meta,message);$('chatFeed').append(el);$('chatFeed').scrollTop=$('chatFeed').scrollHeight}
function escapeHtml(text){const d=document.createElement('div');d.textContent=text;return d.innerHTML}
function openModal(title,text,confirm='決闘を終了'){$('modalTitle').textContent=title;$('modalText').textContent=text;$('modalConfirm').textContent=confirm;$('modalBackdrop').classList.add('show')}

$('chatForm').onsubmit=e=>{e.preventDefault();toast('オンラインサーバー未接続のため送信できません')};
$('createRoom').onclick=()=>toast('オンラインサーバー未接続のためルームを作成できません');
$('summonButton').onclick=$('setButton').onclick=$('attackButton').onclick=$('passButton').onclick=$('deckButton').onclick=$('graveButton').onclick=()=>toast('オンラインサーバーに接続してください');
$('soundToggle').onclick=()=>{soundOn=!soundOn;$('soundToggle').style.color=soundOn?'#b9c3b4':'#697267';toast(soundOn?'サウンド ON':'サウンド OFF')};
$('surrenderButton').onclick=()=>openModal('オンライン接続待ち','対戦サーバーに接続してから決闘を開始できます。','閉じる');
$('modalCancel').onclick=$('modalConfirm').onclick=()=>$('modalBackdrop').classList.remove('show');
$('chatInput').disabled=true;$('chatInput').placeholder='オンラインサーバー接続待ち';$('chatForm').querySelector('button').disabled=true;$('createRoom').disabled=true;
$('roomName').textContent='未接続';$('onlineCount').textContent='サーバー未接続';
$('playerLP').textContent='—';$('enemyLP').textContent='—';
renderRooms();buildZones();render();showCard(null);
$('duelLog').innerHTML='<div class="log-entry"><span>オンラインサーバー接続待ち。ローカル対戦・CPU対戦はありません。</span></div>';

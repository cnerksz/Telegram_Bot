const fetch = require('node-fetch');  //HTTP istekleri için gerekli kütüphane
const TelegramBot = require('node-telegram-bot-api');//Telegram sunucuları ile iletişimde olmak için gerekli kütüphane
const botToken = 'token'; // BotFather üzerinden oluşturlan botun tokenı
const bot = new TelegramBot(botToken, { polling: true }); //polling ile telegram sunucusunda mesajlar sürekli kontrol edilecek şekilde bot oluşturma
const today = new Date(); //Şuanki tarih
const year = today.getFullYear(); //Şuanki tarihten yılı elde etme
const month = String(today.getMonth() + 1).padStart(2, '0'); //padStart(2,'0') fonksiyonu ay eğer tek haneli ise başına sıfır koyar(05 vs)
const day = String(today.getDate()).padStart(2, '0');
const formattedDate = `${year}-${month}-${day}`; //ihtiyacımıza göre yıl ay ve günü formatlama işlemi

/////<--Siteden tokenı elde etme

async function getCookie() {
  try {
    const response = await fetch('websitesi login sayfası', { //kullanıcı adı ve şifreyi logine post etme
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'  //login kısmına göre ayar yapılması gerekir
      },
      body: JSON.stringify({
        username: '*',
        password: '*'
      })
    });

    const cookies = response.headers.raw()['set-cookie']; //post işleminden sonra dönen response üzerinden 'set-cookie' name değerine sahip value değerini elde etme

    //!..benim kullandığım siteye phpsessıd  ile giriş yapılabildiği için bu işlemleri gerçekleştirdim

    for (const cookie of cookies) { // cookies ile elde ettiğimiz değeri PHPSESSID içeriyorsa ';' ifadesine kadar phpSessionValue olarak return etme işlemleri
      if (cookie.includes('PHPSESSID')) {
        const phpSessionValueCookie = cookie.split(';')[0];
        return phpSessionValueCookie;
      }
    }
  } catch (error) {
    console.error('Hata:', error);
  }
}

///// Siteden token elde etme--> 

//// <---Elde edilen tokenla api dan veri çekme ve bota komuta karşılık mesaj göndertme

(async () => {
  try {
    const cookieValue = await getCookie();//  
    if (cookieValue !== null) {
      const apiUrl = `https://orneksite.com/api/ornek/?yil=${year}&ay=${month}`; //Şuanki yıl ve aya göre api urlsi belirleme
       fetch(apiUrl, {   
        method:"GET",
        headers:{"Cookie":`PHPSESSID=*`} //cookie üzerinden erişebildiğimiz için headers içerisine cookie ve önceden elde ettiğimiz veriyi kullandık
    })
        .then(response => response.json())
        .then(data => { 
          const mealList=[data];  //gelen json formatlı datayı dizi içerisine alma
          const menu=mealList.map(m=>m.ornek); //dizi halindeki datadan ihtiyacımız olan fiealdı elde etme benim elde ettiğim field yine bir dizi halinde idi
          let menuList=menu[0][0][0]; 
    
        
    let countDaysinMonth=new Date(year, month, 0).getDate();
  
    for(let menuWeek=0;menuWeek<countDaysinMonth/7;menuWeek++){//Ay ın içerdiği gün sayısına göre hafta sayısnı bulma
        for(let menuDay=0;menuDay<7;menuDay++){
            if(menuWeek===0&&menuDay===0)continue//kullanılmıcak kısmı atlama  
            else{
                if(menu[0][menuWeek][menuDay].filter(f=>f.tarih===formattedDate).length>0){
                    menuList=menu[0][menuWeek][menuDay].filter(f=>f.tarih===formattedDate).map(m=>m.RECADI);//tarihe göre filtreleme işlemi
                    console.log(menuList)
                }
            }
        }
    }
    bot.onText(/\/menu/, (msg) => {//Belirtilen komuta göre botun verilen özelliklerde çalışmasını sağlar
      const chatId = msg.chat.id;
      bot.sendMessage(chatId, menuList.join("\n")); // Menü listesini alt alta listeler ve mesaj olarak döndürür
  });
        })
        .catch(error => {
          console.error('Hata:', error);
        });

    } else {
      console.log('Cookie bulunamadı.');
    }
  } catch (error) {
    console.error('Hata:', error);
  }
})();
//// Elde edilen tokenla api dan veri çekme ve mesaj gönderme--->



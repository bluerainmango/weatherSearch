// 97d190fa05736dbbbe2bbec8cbd5573c
// http://api.openweathermap.org/data/2.5/forecast?id=524901&APPID=
//api.openweathermap.org/data/2.5/weather?q=seoul&APPID=97d190fa05736dbbbe2bbec8cbd5573c

var state = {
                apiKey:'97d190fa05736dbbbe2bbec8cbd5573c',
                searchedCities: [],
                currentWeather: null,
                currentUV: null,
                forecast5days: null
            }

    $('document').ready(function(){

    // Event Handler
    async function searchBtnHandler(e){
        e.preventDefault();
        var input = $('#searchInput').val().trim();
        console.log(input);

        // Get data from server
        await getCurrentWeather(input); console.log(state.currentWeather);
        await getUV(); console.log(state.currentUV);
        await get5days(state.currentWeather.id); console.log(state.forecast5days)


        // Render
        renderCurrentWeather(state.currentWeather);
        renderUV(state.currentUV.value);
        renderDate(state.currentUV.date_iso, '#currentCity__stat--date');
        renderIcon(state.currentWeather.weather[0].icon, '#currentCity__stat--icon');
        render5days(state.forecast5days);

        // LocalStorage
        saveToLocal(state.currentWeather.name);
        renderList();
    }

    // Getting Data
    async function getCurrentWeather(city){
        
        try{

            await $.ajax({
                url: `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&APPID=${state.apiKey}`,
                method: 'GET'
            }).then(function(response){ state.currentWeather = response });

        } catch(err){
            
            alert("The city cannot be found. Please enter a valid city name.");
            throw new Error("Wrong city name. Failed to get data from the server. Stop the app.");

        }

    }
    async function getUV(){

        var lat = state.currentWeather.coord.lat;
        var lon = state.currentWeather.coord.lon;

        try{
            
            await $.ajax({
                url: `http://api.openweathermap.org/data/2.5/uvi?appid=${state.apiKey}&lat=${lat}&lon=${lon}`,
                method: 'GET'
            }).then(function(response){ state.currentUV = response });

        } catch(err){
            throw new Error("Unkown server err during getting UV data. Stop the app.");
        }
        
    }
    async function get5days(cityID){

        try {

            await $.ajax({
                url: `http://api.openweathermap.org/data/2.5/forecast?id=${cityID}&units=imperial&appid=${state.apiKey}`,
                method: 'GET'
            }).then(function(response){
             
                // list up only one listing of each day by time(12 noon) out of 40 listings(3 hourly lists)
                var list5days = response.list.filter(function(val){
                                    var date = val.dt_txt.split(' '); // dt_txt: "2019-12-02 12:00:00"
                                    return date[1].startsWith('12');
                                })
    
                state.forecast5days = list5days;
            });

        } catch(err){
            throw new Error("Unkown server err during getting 5days data. Stop the app.");
        }
        

    }

    // Functions
    function renderCurrentWeather(data){

        // var tempF = convertToFahrenheit(data.main.temp);
        $('#currentCity__stat--city').text(data.name);
        $('#currentCity__stat--temp').text(data.main.temp);
        $('#currentCity__stat--hum').text(data.main.humidity);
        $('#currentCity__stat--wind').text(data.wind.speed);
        
    }
    function renderUV(uv){
        $('#currentCity__stat--uv').text(uv);
    }
    function renderDate(date, addTo){
        var date = new Date();
        var today = `${date.getMonth()+1} / ${date.getDate()} / ${date.getFullYear()}`
        $(addTo).text(today);
    }
    function renderIcon(iconCode, addTo, i=0){
        
        var imgSrc = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
        var imgTag = $($(addTo)[i]).append('<img>').children().eq(0);
            imgTag.attr('src',imgSrc);
        
    }
    function formatDate(date){
        var dateArr = date.split('-');
        return `${dateArr[1]} / ${dateArr[2]} / ${dateArr[0]}`;
    }
    function render5days(data){
        
        $('#5days').empty();

        var l = data.length;

        for( var i = 0 ; i < l ; i++ ){
            
            var date = data[i].dt_txt.split(' ')[0]; // ie: 2019-12-01
                date = formatDate(date);
            var temp = data[i].main.temp;
            var hum = data[i].main.humidity;

            var html = `<div class="card">
                            <h4 class="5days__date">${date}</h3>
                            <div class="5days__icon"></div>
                            <p class="5days__stat">Temp: 
                                <span class="5days__stat--temp">${temp}</span>&#8457;
                            </p>
                            <p class="5days__stat">Humidity: 
                                <span class="5days__stat--hum">${hum}</span>&#37;
                            </p>
                        </div>`

            $('#5days').append(html);

            // Render icon
            var icon = data[i].weather[0].icon;
            renderIcon(icon, '.5days__icon', i);
           
        }
        
    }
    function renderSearchLists(){

        var l = state.searchedCities.length-1;

        for( var i=l ; i >= 0 ; i-- ){
            renderList(i);
        }
    }
    function renderList( i=0 ){

        var city = state.searchedCities[i];
        var duplicated = $(`[data-date="${city}"]`);
        console.log(duplicated)
        duplicated.remove();
        var li = $('<li>').append(city).addClass('search__item').attr('data-date',city);
        $('#search__list').prepend(li);

    }
    function saveToLocal(str){

        state.searchedCities.unshift(str);

        // Delete the duplicated city names 
        var set = Array.from( new Set(state.searchedCities) );
        // Save to state
        state.searchedCities = set;
        // Save to localStorage
        localStorage.setItem('searchedCities', JSON.stringify(set));

    }
    function getFromLocal(){

        var localData = JSON.parse(localStorage.getItem('searchedCities'));
        if(localData){ state.searchedCities = localData };

    }
// Event
    $('#searchBtn').click(searchBtnHandler);

    function init(){
        getFromLocal();

        renderSearchLists();
        // get lastest city index = state[5days].length-1
        // getCurrentWeather(state[5days][index])
        // renderCurrentWeather(state[5days][index])
    }
    init();
    






})


// 97d190fa05736dbbbe2bbec8cbd5573c
// http://api.openweathermap.org/data/2.5/forecast?id=524901&APPID=
//api.openweathermap.org/data/2.5/weather?q=seoul&APPID=97d190fa05736dbbbe2bbec8cbd5573c

var state = {
    apiKey:'97d190fa05736dbbbe2bbec8cbd5573c',
    searchedCities: [],
    currentWeather: null,
    currentUV: null,
    '5days': [],
}

    $('document').ready(function(){

    // Event Handler
    async function searchBtnHandler(e){
        e.preventDefault();
        var input = $('#searchInput').val();
        console.log(input);

        // add city to searchedCities
        state.searchedCities.pop(input);

        // Get data from server
        await getCurrentWeather(input); console.log(state.currentWeather);
        await getUV(); console.log(state.currentUV);

        // Render
        renderCurrentWeather(state.currentWeather);
        renderUV(state.currentUV.value);
        renderDate(state.currentUV.date_iso);
        renderIcon(state.currentWeather.weather[0].icon);
    }

    // Getting Data
    async function getCurrentWeather(city){
        
        await $.ajax({
                        url: `http://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${state.apiKey}`,
                        method: 'GET'
            }).then(function(response){ state.currentWeather = response });

    }
    async function getUV(){

        var lat = state.currentWeather.coord.lat;
        var lon = state.currentWeather.coord.lon;

        await $.ajax({
                        url: `http://api.openweathermap.org/data/2.5/uvi?appid=${state.apiKey}&lat=${lat}&lon=${lon}`,
                        method: 'GET'
                }).then(function(response){ state.currentUV = response });
    }

    // Functions
    function renderCurrentWeather(data){

        var tempF = convertToFahrenheit(data.main.temp);
        $('#currentCity__stat--temp').text(tempF);
        $('#currentCity__stat--hum').text(data.main.humidity);
        $('#currentCity__stat--wind').text(data.wind.speed);
        
    }
    function renderUV(uv){
        $('#currentCity__stat--uv').text(uv);
    }
    function renderDate(date){
        var date = new Date();
        var today = `${date.getMonth()+1} / ${date.getDate()} / ${date.getFullYear()}`
        $('#currentCity__stat--date').text(today);
    }
    function renderIcon(iconCode){
        
        var imgSrc = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
        var imgTag = $('#currentCity__stat--icon').append('<img>').children()[0];
        
        $(imgTag).attr('src',imgSrc);
        
    }
    function convertToFahrenheit (kelvin){
        return (1.8 * (kelvin - 273.15) + 32).toFixed(2);
    }

    
// Event
    $('#searchBtn').click(searchBtnHandler)

})

function init(){
    // localstorage
    // get lastest city index = state[5days].length-1
    // getCurrentWeather(state[5days][index])
    // renderCurrentWeather(state[5days][index])
}
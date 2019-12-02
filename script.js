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

        var city = $('#searchInput').val().trim(); console.log(city);

        // Get server data and render to DOM
        await getDataAndRender(city);

        // Save searches to LocalStorage
        saveToLocal(state.currentWeather.name);
        renderList();
        
    }
    function cityClickHandler(e){

        var city = $(e.target).closest('li').attr('data-city');
        if(city){ getDataAndRender(city) }
    
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
    async function getDataAndRender(city){

        // Get data from server
        await getCurrentWeather(city); console.log(state.currentWeather);
        await getUV(); console.log(state.currentUV);
        await get5days(state.currentWeather.id); console.log(state.forecast5days)

        // Render it to DOM
        renderCurrentWeather(state.currentWeather);
        renderUV(state.currentUV.value);
        renderDate(state.currentUV.date_iso, '#currentCity__stat--date');
        renderIcon(state.currentWeather.weather[0].icon, '#currentCity__stat--icon');
        render5days(state.forecast5days);

    }
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

        // if there is already a img, delete it
        if( $($(addTo)[i]).children().length > 0 ){
            $(addTo).empty();
        }

        var imgSrc = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
        var imgTag = $($(addTo)[i]).append('<img>').children().eq(0);
            imgTag.attr('src',imgSrc);
        
    }
    function formatDate(date){
        var dateArr = date.split('-');
        return `${dateArr[1]} / ${dateArr[2]} / ${dateArr[0]}`;
    }
    function render5days(data){
        
        $('#fiveDays').empty();

        var l = data.length;

        for( var i = 0 ; i < l ; i++ ){
            
            var date = data[i].dt_txt.split(' ')[0]; // ie: 2019-12-01
                date = formatDate(date);
            var temp = data[i].main.temp;
            var hum = data[i].main.humidity;

            var html = `<div class="card">
                            <h4 class="fiveDays__date">${date}</h3>
                            <div class="fiveDays__icon"></div>
                            <p class="fiveDays__stat">Temp: 
                                <span class="fiveDays__stat--temp">${temp}</span>&#8457;
                            </p>
                            <p class="fiveDays__stat">Humidity: 
                                <span class="fiveDays__stat--hum">${hum}</span>&#37;
                            </p>
                        </div>`

            $('#fiveDays').append(html);

            // Render icon
            var icon = data[i].weather[0].icon;
            renderIcon(icon, '.fiveDays__icon', i);
           
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

        // Delete duplicated search if applicable
        var duplicated = $(`[data-city="${city}"]`);
        if(duplicated){ duplicated.remove() }
        
        // Create list and render to DOM(always the latest search is on the top of the list)
        var li = $('<li>').append(city).addClass('search__item').attr('data-city',city);
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
    function init(){

        // Get data from localStorage
        getFromLocal();
        
        // Render searched cities list
        renderSearchLists();

        // Render last searched city's weather & 5days forecast
        getDataAndRender(state.searchedCities[0]);

    }

// Search button event
    $('#searchBtn').click(searchBtnHandler);

// Searched cities click event
    $('#search__list').click(cityClickHandler)

    init();
  
})


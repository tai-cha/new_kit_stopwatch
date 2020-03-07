((_pid, _app) => {

    const isDisabled = selector => (_app.dom(selector).filter('.-disabled').length > 0);

    const toggleDisabled = selector => {
        const elems = _app.dom(selector);
        Array.prototype.forEach.call(dom, (el)=>{
            if (el.filter(':not(-disabled)').length > 0){
                el.removeClass('-disabled');
            } else {
                el.addClass('-disabled');
            }
        });
    }

    const zeroPad = (obj, len) => String(obj).padStart(len, '0');

    const formatTime = timediff => {
        const ordinal_sec = Math.floor(timediff / 1000);
        const hours = Math.floor(ordinal_sec / 3600);
        const minutes = Math.floor((ordinal_sec - (hours * 3600)) / 60);
        const seconds = ordinal_sec - hours * 3600 - minutes * 60;
        const millsec = timediff - ordinal_sec * 1000;
        return `${zeroPad(hours, 2)}:${zeroPad(minutes, 2)}:${zeroPad(seconds, 2)}.${zeroPad(millsec, 3)}`
    }

    const currentTime = () => _app.data('accumulated_time') + _app.data('time');
    const lapTime = () => currentTime() - (_app.data().last_lap_time || 0);

    const events = {
        init() {
            _app.data('start', null);
            _app.data('time', 0);
            _app.data('accumulated_time', 0);
            _app.data('last_lap_time', null);
            _app.data('show_text', '00:00:00.000');
            _app.data('lap_text', null);
            _app.dom('.start').show();
            _app.dom('.stop').hide();
            _app.dom('.reset').hide();
            _app.dom('.laps').html('');
            _app.dom('.lap:not(.-disabled)').addClass('-disabled');
        },
        start() {
            // もしintervalが空なら
            if(!_app.data('interval')){
                _app.data('start', Date.now());
                _app.dom('.start').hide();
                _app.dom('.stop').show();
                _app.dom('.lap.-disabled').removeClass('-disabled');
                _app.dom('.reset').show();
                _app.data('interval', setInterval(()=>{ _app.event('update') }, 10));
            }
        },
        update() {
            _app.data('time', Date.now() - _app.data('start'));
            _app.data('show_text', formatTime(currentTime()));
            _app.data('lap_text', formatTime(lapTime()));
        },
        lap() {
            if(!isDisabled('.lap')){
                _app.dom('ol.laps').prepend(`<li>${formatTime(lapTime())}</li>`);
                _app.data('last_lap_time', currentTime());
                return currentTime();
            }else return false;
        },
        stop() {
            if(_app.data('interval')) clearInterval(_app.data('interval'));
            _app.data('accumulated_time', currentTime());
            _app.data('interval', null);
            _app.dom('.start').show();
            _app.dom('.stop').hide();
            _app.dom('.lap:not(.-disabled)').addClass('-disabled');
        },
        reset() {
            _app.event('stop');
            _app.event('init');
        }
    }

    Object.keys(events).forEach((key) => _app.event(key, events[key]));

    _app.event('init')();

})(pid, app);
document.addEventListener('DOMContentLoaded', function () {
const enableSleeper = document.getElementById('auto-scan');
const sleeper = document.getElementById('sleep-timer');

enableSleeper.addEventListener('change', function(){
    if (this.checked){
        sleeper.removeAttribute('readonly');
        
    } else {
        sleeper.setAttribute('readonly', true);
        sleeper.value = '0';
    }
});

const enableNotation = document.getElementById('scan-notation');
const notation = document.getElementById('notation');
enableNotation.addEventListener('change', function(){
    if (this.checked){
        notation.removeAttribute('readonly');
    } else {
        notation.setAttribute('readonly', true);
        notation.value = 'Notation';
    }
});
});
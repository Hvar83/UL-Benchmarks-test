document.addEventListener("DOMContentLoaded", theDomHasLoaded, false);
window.addEventListener("load", pageFullyLoaded, false);
  

$.getJSON("./test.json", function (data) {
    loadResultDataIn(data);
});

function theDomHasLoaded(e) {
    // when DOM is fully loaded
}

function pageFullyLoaded(e) {
    // when page is fully loaded
}

function loadResultDataIn(result) {
    loadOverallScore(result.results[0], result.systemInfo, result.rangeStatistics);
    loadComponentScores(result.results[0].scores.componentScores);

    $('#TEST_NAME').html("Time Spy Extreme");
}

function loadOverallScore(result, systemInfo, rangeValues) {
    $('.procyon-overall-score h2').html('Time Spy Extreme' + ' score');
    $('.procyon-overall-score .main-score h3').html(result.scores.overallScore.uiValue);
    $('.procyon-overall-score .main-score').append('<div id="chart-container"><canvas id="main-chart"></canvas></div>');
    loadCharts('main-chart', result.scores.overallScore.score);
    loadNumbersCounter('.procyon-overall-score .main-score', result.scores.overallScore.diff, result, systemInfo, rangeValues);

    let gpuString = '';
    systemInfo.gpu.forEach(gpu => {
        gpuString +=
            `
            <div class="flex-col w25">
                <p class="pl0">GPU:</p>
            </div>
            <div class="flex-col w75 procyon-backgrounded mb05">
                <p>${gpu.name}</p>
            </div>
            `;
    });
    $('.gpu-summary').html(gpuString);

    let cpuString = '';
    systemInfo.cpu.forEach(cpu => {
        cpuString +=
            `
            <div class="flex-col w25">
                <p class="pl0">CPU:</p>
            </div>
            <div class="flex-col w75 procyon-backgrounded mb05">
                <p>${cpu.name}</p>
            </div>
            `;
    });
    $('.cpu-summary').html(cpuString);
}

function loadComponentScores(componentScores) {
    let componentScoreString = '';
    componentScores.forEach(score => {
        componentScoreString +=
            `
            <div class="${score.baseType.toLowerCase()} w100 procyon-result-box flex-col-stretch p1">
                 <h3 class="no-border pb05">${score.baseType}</h3>
                 <h2 class="center no-border pt05 count">${score.uiValue}</h2>
                 <p class="center feedback"></p>
                 <div id="chart-container" class="center"><canvas width="180" height="100" id="main-chart-${score.baseType.toLowerCase()}"></canvas></div>
            </div>
            `;
            
    });
    
    $('#COMPONENT_SCORE').html(componentScoreString);

    componentScores.forEach(score => {
        loadNumbersCounter('.' + score.baseType.toLowerCase() + '.procyon-result-box.p1', score.diff)
        loadCharts('main-chart-' + score.baseType.toLowerCase(), score.score)
    });
    
}

function loadDetailedScores(componentScores, rangeValues) {
    let componentScoreString = '';
    componentScores.forEach(score => {
        let subScoreString = '';
        const title = score.baseType.split("_")[0].toLowerCase() === 'graphics' ? 'gpu' : score.baseType.split("_")[0].toLowerCase();
        const range = calculateRange(true, title, undefined, score.score, rangeValues);
        const classRangeContainer = calculateClassRange(range.property, false);
        const classRange = calculateClassRange(range.property, true);
        const tooltipMessage = range.property + ': the value ' + score.score + ' is included between ' + range.range[0] + ' and ' + range.range[1] + ' ' + range.measure;
        
        score.subScores.forEach( subScore => {
            const subTitle = subScore.baseType.toLowerCase();
            const feedbackSub = calculateRange(false, title, subTitle, subScore.score, rangeValues);
            const classRangeContainerSub = calculateClassRange(feedbackSub.property, false);
            const classRangeSub = calculateClassRange(feedbackSub.property, true);
            const tooltipMessageSub = feedbackSub.property + ': the value ' + subScore.score + ' is included between ' + feedbackSub.range[0] + ' and ' + feedbackSub.range[1] + ' ' + feedbackSub.measure;

            subScoreString +=
                `
                <div class="w100">
                    <div class="flex-row w100 procyon-deepsubscore pl1 pb05">
                        <div class="w50 pr05 fade-in">
                            <h4>${subScore.baseType}</h4>
                        </div>
                        <div class="w40 fade-in">
                            <p>${toLocal(parseInt(subScore.uiValue))} ${subScore.unit} </p>
                        </div>
                        <div class="w10 fade-in-icons" title="${tooltipMessageSub}" data-class="${feedbackSub.property}">
                            <div class="icon-container feedback tooltip-message ${classRangeContainerSub}"><i class="icon ${classRangeSub} fm-icon feedback-icon center mr0"></i></div>
                        </div>
                    </div>
                </div>
                `;
        });

        componentScoreString +=
            `
            <div class="flex-col-start w30 m05">
            <h3 class="border-bottom pb05 mb05 uppercase"><i class="icon icon-${title} fm-icon mr05"></i>${title}</h3>
                <div class="flex-row procyon-subscore pb05 fade-in">
                    <div class="w50 pr05 fade-in">
                        <h3>SCORE</h3>
                    </div>
                    <div class="w40 fade-in">
                        <p>${toLocal(parseInt(score.uiValue))}</p>
                    </div>
                    <div class="w10">
                        <div class="icon-container feedback tooltip-message ${classRangeContainer}" title="${tooltipMessage}" data-class="${range.property}"><i class="icon ${classRange} fm-icon feedback-icon center mr0"></i></div>
                    </div>
                </div>
                ${subScoreString}
            </div>
            `;
    });
    $('.procyon-component-score').html(componentScoreString);
}

function loadSystemInfo(systemInfo) {
    let cpuString = `<h3 class="border-bottom pb05"><i class="icon icon-cpu fm-icon mr05"></i>CPU</h3>`;
    systemInfo.cpu.forEach( cpu => {
        cpuString +=
            `
            <div each={opts.run.systemInfo.cpu} class="mb05">
                    <dl class="result-systeminfo-list-details clearfix fade-in">

                      <dt>CPU</dt>
                      <dd>${cpu.name}</dd>

                      <dt>Codename</dt>
                      <dd>${cpu.processorCodeName}</dd>

                      <dt>Clock frequency</dt>
                      <dd>${cpu.stockFrequencyMhz}MHz</dd>

                      <dt>Max Frequency</dt>
                      <dd>${cpu.maxFrequencyMhz} MHz</dd>

                      <dt>Cores</dt>
                      <dd>${cpu.coreCount} (${cpu.threadCount})</dd>

                      <dt>Package</dt>
                      <dd>${cpu.processorPackage}</dd>

                      <dt>Manufacturing process</dt>
                      <dd>${cpu.manufacturingProcessNm} NM</span></dd>

                      <dt>Core VID</dt>
                      <dd>${cpu.voltageId} V</dd>

                      <dt>Virtual Technology</dt>
                      <dd>${cpu.virtualTechnologyCapable}</dd>
                    </dl>
                  </div>
            `
    });
    $('#SYSTEMINFO_CPU').html(cpuString);

    let gpuString = `<h3 class="border-bottom pb05"><i class="icon icon-gpu mr05"></i>GPU</h3>`;
    systemInfo.gpu.forEach( gpu => {
        let displayString = '';
        gpu.displays.forEach( (display, i) => {
            displayString +=
                `
                <dl class="result-systeminfo-list-details clearfix fade-in">
                        <dt>Display ${i+1}</dt>
                        <dd>${display.deviceName} (${display.resolution})</dd>
                </dl>
                `;
        });

        gpuString +=
            `
            <div class="mb05">
                    <dl class="result-systeminfo-list-details clearfix fade-in">
                      <dt>GPU</dt>
                      <dd>${gpu.name}</dd>

                      <dt>Memory</dt>
                      <dd>${gpu.memory.memoryAmountMb} MB ${gpu.memory.memoryType}</dd>

                      <dt>Available VRAM</dt>
                      <dd>${gpu.memory.availableVram} MB</dd>

                      <dt>Code Name</dt>
                      <dd>${gpu.codeName}</dd>

                      <dt>Manufacturer</dt>
                      <dd>${gpu.pciDeviceId.vendorName} / ${gpu.pciDeviceId.subvendorName}</dd>

                      <dt>Manufacturing process</dt>
                      <dd>${gpu.manufacturingProcess} NM</dd>
                      <dt>Driver Version</dt>
                      <dd>${gpu.driverInfo.driverVersion}</dd>

                      <dt>Clock frequency</dt>
                      <dd>${gpu.clockSpeed.gpu.currentMhz} MHz</dd>

                      <dt>Boost</dt>
                      <dd>${gpu.clockSpeed.boost.currentMhz} MHz
                      </dd>

                      <dt>Memory clock frequency</dt>
                      <dd>${gpu.clockSpeed.memory.currentMhz} MHz</dd>
                    </dl>

                    <div class="systeminfo-display-list">
                      ${displayString}
                    </div>
                  </div>
            `;
    });
    $('#SYSTEMINFO_GPU').html(gpuString);

    let storageString = `<h3 class="border-bottom pb05"><i class="icon icon-download fm-icon mr05"></i>Storage</h3>`;
    systemInfo.storage.forEach( (storage, i) => {
        storageString +=
            `
            <div class="systeminfo-storage-list">
                      <dl class="result-systeminfo-list-details clearfix fade-in">
                        <dt>Drive ${i+1}</dt>
                        <dd class="pr15">${storage.driveName}</dd>
                      </dl>
                      <div class="storage-info">
                        <dl class="result-systeminfo-list-details clearfix pl1">
                          <dt class="">Drive Model</dt>
                          <dd class="">${storage.driveModel}</dd>
                        </dl>
                        <dl class="result-systeminfo-list-details clearfix pl1">
                          <dt class="">Drive Type</dt>
                          <dd class="">${storage.driveType}</dd>
                        </dl>
                      </div>
                  </div>
            `;
    });
    $('#SYSTEMINFO_STORAGE').html(storageString);
}

function loadNumbersCounter(element, text, result = null, info = null, range = null) {
    $(element + ' .count').each(function () {
        $(this).prop('Counter',0).animate({
            Counter: parseInt($(this).text().trim())
        }, {
            duration: 1500,
            easing: 'swing',
            step: function (now) {
                $(this).text(toLocal(Math.ceil(now)));
            },
            complete: function() {
               const arrow = '<span class="arrow"></span>';
               $(element + ' p').html(arrow + text.value + ' ' + text.text);
               text.positive === 'undefined' ? '' : (text.positive ? $('span.arrow').addClass('positive') : $('span.arrow').addClass('negative'))
               if (info && result) {
                loadDetailedScores(result.scores.componentScores, range);
                loadSystemInfo(info);
               }
            }
        });
    });
}

function toLocal(x) {
    return x.toLocaleString(document.querySelector('html').getAttribute('lang'));
}

function loadCharts(chartId, data) {
    var opts = {
        angle: 0,
        lineWidth: 0.2,
        radiusScale: 1,
        pointer: {
            length: 0.6,
            strokeWidth: 0.035,
            color: '#000000' 
        },
        limitMax: false,
        limitMin: false,
        colorStart: '#6FADCF',
        colorStop: '#8FC0DA',
        strokeColor: '#E0E0E0',
        generateGradient: true,
        highDpiSupport: true,
        staticZones: [
            {strokeStyle: "#F03E3E", min: 0, max: 500},
            {strokeStyle: "#FFDD00", min: 501, max: 1500},
            {strokeStyle: "#92C83E", min: 1501, max: 5000}
        ],
        staticLabels: {
            font: "10px sans-serif", 
            labels: [500, 1500],
            color: "#000000"
        }
    }

    var target = document.getElementById(chartId);
    var gauge = new Gauge(target).setOptions(opts); 
    gauge.maxValue = 5000; 
    gauge.setMinValue(0); 
    gauge.animationSpeed = 45; 
    gauge.set(data);
}

function calculateRange(isScoreTitle = true, title, subtitle, value, range) {
    if (isScoreTitle) {
        if (range[title].hasOwnProperty('score')) {
            return checkRange(parseInt(value), range[title].score);
        } else {
            return 
        }
    } else {
        if (range[title].hasOwnProperty(subtitle)) {
            return checkRange(parseInt(value), range[title][subtitle]); 
        }
    }
}

function checkRange(value, valueRange) {
    for (const property in valueRange) {
        if (Array.isArray(valueRange[property]) && value >= valueRange[property][0] && value <= valueRange[property][1]) {
            return {
                'measure': valueRange['mesure'],
                'property': property,
                'range': valueRange[property]
            }
        }
    }
}

function calculateClassRange(feedback, isIcon) {
    if (isIcon) {
        switch (feedback) {
            case 'positive': 
              return 'icon-tick';
            case 'warning':
              return 'icon-warning01';
            case 'fail':
              return 'icon-cross';
            default:
                return ''; 
        }
    } else {
        switch (feedback) {
            case 'positive': 
              return 'valid';
            case 'warning':
              return 'warning';
            case 'fail':
              return 'invalid';
            default:
                return ''; 
        }
    }
}

$(document).ready(function(){
    $( document ).tooltip({
        position: {
            my: 'center bottom-20',
            at: 'center top',
            using: function( position, feedback ) {
              $( this ).css( position );
              $( '<div>' )
                .addClass( 'tooltip-arrow' )
                .addClass( feedback.vertical )
                .addClass( feedback.horizontal )
                .appendTo( this );
            }
        }
    });

    $('#check-state .checkbox-switcher').attr("checked",false);

    $('.check-state').click(function() {
        $('.feedback').toggle('slow');
    });
})

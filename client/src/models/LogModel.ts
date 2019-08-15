export class LogModel {
    msg: string;
    source: string;
    timestamp: string;
    infoLevel: string;
    inputMetric: number;
    inputMetricType: string;

    constructor(msg: string="", source: string="", timestamp: string="", infoLevel: string="", inputMetric: number=0, inputMetricType: string="") {
        this.msg = msg;
        this.source = source;
        this.timestamp = timestamp;
        this.infoLevel = infoLevel;
        this.inputMetric = inputMetric;
        this.inputMetricType = inputMetricType;
    }
}

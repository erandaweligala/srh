export interface PlansQueryModel {
    page: number,
    page_size: number,
    planId? : string,
    planName? : string,
    planType? : string,
    status? : string,
    recurringFlag? : boolean,
    recurringPeriod? : string,
    connectionType? : string,
    quotaProrationFlag? : boolean
}
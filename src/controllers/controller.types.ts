export interface IRequest {
    method?: string,
    url?: string,
    query?: { },
    body: { },
    auth?: {
        _id?: string
    }
}

export interface IResponse {
    status: Function,
    json: Function,
    set: Function,
    send: Function,
    sendFile: Function,
    cookie: Function,
    clearCookie: Function,
    writeHead: Function
};



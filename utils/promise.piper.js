class PromisePiperElement {
    promise:  Promise< any >;
    promiseHandler:  any;
    resolve: (res) => {};
    reject: (err) => {};
    constructor( promiseHandler: any ) {
        this.promiseHandler = promiseHandler;
    }
}

export default class PromisePiper {
    context: any = false;
    resolve: ( res ) => {};
    reject: ( err ) => {};
    results: Array< any > = [];
    resolved: Array< PromisePiperElement > = [];
    promisesStack: Array< PromisePiperElement > = [];
    constructor( context?: any ) {
        if ( context ) {
            this.setContext( context );
        }
    }
    setContext( context ) {
        this.context = context;
    }
    pipe( promiseHandler: any ) {
        this.promisesStack.push( new PromisePiperElement( promiseHandler ) );
        return this;
    }
    then( reolveForLast?, rejectForLast? ) {
        this.promisesStack[ this.promisesStack.length - 1 ].resolve = reolveForLast;
        this.promisesStack[ this.promisesStack.length - 1 ].reject = rejectForLast;
        return this;
    }
    finally( resolveForFinal, rejectForFinal ) {
        this.resolve = resolveForFinal;
        this.reject = rejectForFinal;
        this.tryNext();
    }
    tryNext() {
        let nextPromiseElement: any = false;
        let isFinal: any = false;

        if ( this.promisesStack.length > 1 ) {
            nextPromiseElement = this.promisesStack.shift();
        } else if ( this.promisesStack.length === 1 ) {
            isFinal = true;
            nextPromiseElement = this.promisesStack.shift();
        } else {
            return false;
        }
        let promiseHandler = this.context ? nextPromiseElement.promiseHandler.bind( this.context ) : nextPromiseElement.promiseHandler;
        nextPromiseElement.promise = new Promise( promiseHandler ).then( ( result ) => {
            this.results.push( result );
            if ( isFinal ) {
                this.resolve( this.results );
            } else {
                if ( nextPromiseElement.resolve ) {
                    nextPromiseElement.resolve( result );
                }
                this.tryNext();
            }
            this.resolved.push( nextPromiseElement );
        }, ( err ) => {
            if ( nextPromiseElement.reject ) {
                nextPromiseElement.reject( err );
            }
            this.reject( err );
        } );
    }
}

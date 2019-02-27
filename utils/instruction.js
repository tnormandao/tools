export default class Instruction {

    /**
     * instruction callbacks storage
     */
    _S: any = [];

    /**
     * Instruction
     *
     *  special Instruction object who store stack of function who can run together
     * @param i1 - function or name *
     * @param i2 - if first argument its a name
     * @constructor
     */
    constructor( arg1?: any, arg2?: any ) {
        if ( arg1 ) {
            if ( arg2 ) {
                return this.add( arg1, arg2 );
            } else {
                return this.add( arg1 );
            }
        }
        return this;
    }
    /**
     * add new instruction with ( myFunc ), or ( 'myFuncName', myFunc )
     * @param i1 - function or name *
     * @param i2 - if first argument its a name
     */
    add( a1: any, a2?: any ): Instruction {
        if ( a1 && !a2 && typeof a1 === 'function' ) {
            this._S.push( {
                n: 'f_' + this._S.length,
                f: a1
            } );
        } else if ( a1 && a2 && typeof a1 === 'string' && typeof a2 === 'function') {
            this._S.push( {
                n: a1,
                f: a2
            } );
        }
        return this;
    }

    set (a1: any, a2: any) {
        let S = this, _S = this._S;
        if ( a1 && a2 && typeof a1 === 'string' && typeof a2 === 'function') {
            let fo: any = false;
            if (_S.length > 0) {
                for ( let i = 0; i < _S.length; i++) {
                    if (_S[i].n === a1) {
                        _S[i] = { n: a1, f: a2 };
                        fo = true;
                    }
                    if ( i === _S.length - 1 && !fo ) {
                        S.add( a1, a2);
                    }
                }
            } else {
                S.add( a1, a2);
            }
        } else if ( a1 && !a2 && typeof a1 === 'function') {
            this.add( a1, false );
        }
    }

    /**
     * get requested functions from Instruction
     * @param n - string or function ('myFuncName') | (myFunc) | empty
     * @returns {*} - return all objects by 'myFuncName' | myFunc#jsLink | allFuncInStack
     */
    get( n: any ) {
        if ( n ) {
            let field: any = (typeof n === 'string') ? 'n' : 'f';
            for ( let i = 0; i < this._S.length; i++ ) {
                if ( this._S[i][ field ] === n) {
                    return this._S[i];
                }
            }
        } else {
            return this._S;
        }
        return false;
    }

    /**
     * Check instruction in
     *
     * @param n
     * @returns {boolean}
     */
    has( n: any ) {
        if ( n ) {
            let field: any = ( typeof n === 'string' ) ? 'n' : 'f';
            for ( let i = 0; i < this._S.length; i++ ) {
                if ( this._S[i][ field ] === n) {
                    return true;
                }
            }
            return false;
        } else {
            return false;
        }
    }

    /**
     * drop custom function in instruction
     * @param n - string or function ('myFuncName') | (myFunc) | empty
     * @returns {*} - return all objects by 'myFuncName' | myFunc#jsLink | allFuncInStack
     */
    drop ( n: any ) {
        if ( n ) {
            let N: any = ( typeof n === 'string' ) ? 'n' : 'f';
            for ( let i = 0; i < this._S.length; i++ ) {
                if ( this._S[i][N] === n ) {
                    this._S.splice(i, 1);
                }
            }
        } else {
            this._S = [];
        }
    }


    /**
     * get random func from storage
     * @returns {*} - one random func from storage
     */
    getRandom () {
        if ( this._S.length === 0 ) { return false; }
        let randomStorageObject = this._S[ Math.floor( Math.random() * this._S.length) ];
        return {
            name: randomStorageObject.n,
            action: randomStorageObject.f
        };
    }

    /**
     *  run all functions in Instruction
     * @param t - transported to first arg in all functions
     * @param ff - experimantal filter
     * @param cb - callback
     */
    run( _t: any, _ff: any, cb: any ) {
        let S: any = this,
            _S: any = this._S;
        let t: any = _t ? _t : false,
            ff: any = _ff ? _ff : false;
        for ( let i = 0; i < _S.length; i++ ) {
            if ( !ff ) {
                _S[i].f( t , _S[i].n );
            } else {
                if ( ff( _S[i].n, i) ) {
                    _S[i].f( t , _S[i].n );
                }
            }
            if ( cb && i === _S.length - 1 ) {
                cb();
            }
        }
    }

}

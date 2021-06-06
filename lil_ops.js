const { store } = require('./index')
const { getPathNum } = require('./getPathNum')
const { getPathObj } = require('./getPathObj')
const crypto = require('crypto');
const bs58 = require('bs58');
const hashFunction = Buffer.from('12', 'hex');
const {
  Client,  
  Signature,
  cryptoUtils,
} = require('@hiveio/dhive');
const stringify = require('json-stable-stringify');

const forceCancel = (rate, type, block_num) => {
    return new Promise((resolve, reject) => {
        const price = parseFloat(rate)
        let Ps = getPathObj(['dex', type, 'sellOrders'])
        let Pb = getPathObj(['dex', type, 'buyOrders'])
        Promise.all([Ps, Pb])
            .then(s => {
                let gone = 0
                for (o in s[0]) {
                    if (parseFloat(o.split(":")[0]) < (price * .6)) {
                        gone++
                        release(o.from, o.split(":")[1], block_num)
                    } else if (parseFloat(o.split(":")[0]) > (price * 1.4)) {
                        gone++
                        release(o.from, o.split(":")[1], block_num)
                    }
                }
                for (o in s[1]) {
                    if (parseFloat(o.split(":")[0]) < (price * .6)) {
                        gone++
                        release(o.from, o.split(":")[1], block_num)
                    } else if (parseFloat(o.split(":")[0]) > (price * 1.4)) {
                        gone++
                        release(o.from, o.split(":")[1], block_num)
                    }
                }
                resolve(gone)
            })
            .catch(e => { reject(e) })
    })
}
exports.forceCancel = forceCancel

const add = (node, amount) => {
    return new Promise((resolve, reject) => {
        store.get(['balances', node], function(e, a) {
            if (!e) {
                console.log(amount)
                const a2 = typeof a != 'number' ? amount : a + amount
                console.log(a2)
                store.batch([{ type: 'put', path: ['balances', node], data: a2 }], [resolve, reject, 1])
            } else {
                console.log(e)
            }
        })
    })
}
exports.add = add

const addCol = (node, amount) => {
    return new Promise((resolve, reject) => {
        store.get(['col', node], function(e, a) {
            if (!e) {
                const a2 = typeof a != 'number' ? amount : a + amount
                console.log({ node, a })
                store.batch([{ type: 'put', path: ['col', node], data: a2 }], [resolve, reject, 1])
            } else {
                console.log(e)
            }
        })
    })
}
exports.addCol = addCol

const addGov = (node, amount) => {
    return new Promise((resolve, reject) => {
        store.get(['gov', node], function(e, a) {
            if (!e) {
                const a2 = typeof a != 'number' ? amount : a + amount
                console.log({ node, a })
                store.batch([{ type: 'put', path: ['gov', node], data: a2 }], [resolve, reject, 1])
            } else {
                console.log(e)
            }
        })
    })
}
exports.addGov = addGov

const deletePointer = (escrowID, user) => {
    return new Promise((resolve, reject) => {
        const escrow_id = typeof escrowID == 'string' ? escrowID : escrowID.toString()
        store.get(['escrow', escrow_id], function(e, a) {
            if (!e) {
                var found = false
                const users = Object.keys(a)
                for (i = 0; i < users.length; i++) {
                    if (user = users[i]) {
                        found = true
                        break
                    }
                }
                if (found && users.length == 1) {
                    store.batch([{ type: 'del', path: ['escrow', escrow_id] }], [resolve, reject, users.length])
                } else if (found) {
                    store.batch([{ type: 'del', path: ['escrow', escrow_id, user] }], [resolve, reject, users.length])
                }
            }
        })
    })
}
exports.deletePointer = deletePointer

const credit = (node) => {
    return new Promise((resolve, reject) => {
        getPathNum(['markets', 'node', node, 'wins'])
            .then(a => {
                store.batch([{ type: 'put', path: ['markets', 'node', node, 'wins'], data: a++ }], [resolve, reject, 1])
            })
            .catch(e => {
                reject(e)
            })
    })
}
exports.credit = credit


const nodeUpdate = (node, op, val) => {
    return new Promise((resolve, reject) => {
        store.get(['markets', 'node', node], function(e, a) {
            if (!e) {
                if (!a.strikes)
                    a.strikes = 0
                if (!a.burned)
                    a.burned = 0
                if (!a.moved)
                    a.moved = 0
                switch (op) {
                    case 'strike':
                        a.strikes++
                            a.burned += val
                        break
                    case 'ops':
                        a.escrows++
                            a.moved += val
                        break
                    default:
                }
                store.batch([{ type: 'put', path: ['markets', 'node', node], data: a }], [resolve, reject, 1])
            } else {
                console.log(e)
                resolve()
            }
        })
    })
}
exports.nodeUpdate = nodeUpdate

const penalty = (node, amount) => {
    console.log('penalty: ', { node, amount })
    return new Promise((resolve, reject) => {
        pts = getPathNum(['gov', node])
        Promise.all([pts]).then(r => {
            var a2 = r[1]
            newBal = a2 - amount
            if (newBal < 0) { newBal = 0 }
            const forfiet = a2 - newBal
            var ops = [{ type: 'put', path: ['gov', node], data: newBal }]
            nodeUpdate(node, 'strike', amount)
                .then(empty => {
                    store.batch(ops, [resolve, reject, forfiet])
                })
                .catch(e => { reject(e) })
        }).catch(e => {
            reject(e)
        })
    })
}
exports.penalty = penalty

const chronAssign = (block, op) => {
    return new Promise((resolve, reject) => {
        const t = block + ':' + hashThis(stringify(op))
        store.batch([{ type: 'put', path: ['chrono', t], data: op }], [resolve, reject, t])
    })
}
exports.chronAssign = chronAssign

const recast = (attempts, txid, bn) => {
    return new Promise((resolve, reject) => {
        var tries = JSON.parse(attempts)
        var Pop = getPathObj(['ms', 'ops', txid]),
            Pstats = getPathObj(['stats']),
            Pagents = getPathObj(['agents'])
    Promise.all([Pop, Pstats, Pagents])
        .then(got => {
            let msop = JSON.parse(got[0]),
                stats = got[1],
                agents = got[2],
                ops = [],
                sigsA = [],
                auths = 0,
                op = {
                    expiration: msop.expiration,
                    extensions: msop.extensions,
                    operations: msop.operations,
                    ref_block_num: msop.ref_block_num,
                    ref_block_prefix: msop.ref_block_prefix,
                }
                for (sig in msop.signatures){
                    if(signedBy(op, msop.signatures[sig], agents)){
                        auths++
                        sigsA.push(msop.signatures[sig]) //edgecase authorized signature removed
                    }
                }
                if(auths < stats.auth_at){
                    ops.push({ type: 'put', path: ['feed', `${bn}:v_op`], data: `Multi-Sig Failure at Recast: Insufficient Signatures` })
                } else {
                msop.signatures = sigsA
                broadcast(msop)
                    .then(r=>console.log('Multi-Sig Send Success\n', r))
                    .catch(e=>console.log('Multi-Sig Send Failure\n', e))
                msop.chron = chronAssign(bn + 30, {
                        block: bn + 30,
                        op: 'ms_send',
                        attempts: JSON.stringify(tries),
                        txid: txid
                    })
                
                ops.push({ type: 'put', path: ['ms', 'ops', txid], data: JSON.stringify(msop) })
                }
                store.batch([{ type: 'put', path: ['chrono', t], data: op }], [resolve, reject, t])
            })
    })
}
exports.recast = recast

const release = (from, txid, bn) => {
    return new Promise((resolve, reject) => {
        store.get(['contracts', from, txid], function(er, a) {
            if (er) { console.log(er); } else {
                var ops = [];
                switch (a.type) {
                    case 'ss':
                        store.get(['dex', 'hive', 'sellOrders', `${a.rate}:${a.txid}`], function(e, r) {
                            if (e) { console.log(e); } else if (isEmpty(r)) { console.log('Nothing here' + a.txid); } else {
                                add(r.from, r.amount).then(empty => {
                                    ops.push({ type: 'del', path: ['contracts', from, txid] });
                                    ops.push({ type: 'del', path: ['chrono', a.expire_path] });
                                    ops.push({ type: 'del', path: ['dex', 'hive', 'sellOrders', `${a.rate}:${a.txid}`] });
                                    store.batch(ops, [resolve, reject]);
                                }).catch(e => { reject(e); });
                            }
                        });
                        break;
                    case 'ds':
                        store.get(['dex', 'hbd', 'sellOrders', `${a.rate}:${a.txid}`], function(e, r) {
                            if (e) { console.log(e); } else if (isEmpty(r)) { console.log('Nothing here' + a.txid); } else {
                                add(r.from, r.amount).then(empty => {
                                    ops.push({ type: 'del', path: ['contracts', from, txid] });
                                    ops.push({ type: 'del', path: ['chrono', a.expire_path] });
                                    ops.push({ type: 'del', path: ['dex', 'hbd', 'sellOrders', `${a.rate}:${a.txid}`] });
                                    store.batch(ops, [resolve, reject]);
                                }).catch(e => { reject(e); });

                            }
                        });
                        break;
                    case 'sb':
                        store.get(['dex', 'hive', 'buyOrders', `${a.rate}:${a.txid}`], function(e, r) {
                            if (e) { console.log(e); } else if (isEmpty(r)) { console.log('Nothing here' + a.txid); } else {
                                a.cancel = true;
                                chronAssign(bn + 200, { op: 'check', agent: r.reject[0], txid: r.txid + ':cancel', acc: from, id: txid })
                                    .then(empty => {
                                        ops.push({ type: 'put', path: ['escrow', r.reject[0], r.txid + ':cancel'], data: r.reject[1] });
                                        ops.push({ type: 'put', path: ['contracts', from, r.txid], data: a });
                                        ops.push({ type: 'del', path: ['dex', 'hive', 'buyOrders', `${a.rate}:${a.txid}`] });
                                        store.batch(ops, [resolve, reject]);
                                    }).catch(e => { reject(e); });
                            }
                        });
                        break;
                    case 'db':
                        store.get(['dex', 'hbd', 'buyOrders', `${a.rate}:${a.txid}`], function(e, r) {
                            if (e) {
                                console.log(e);
                            } else if (isEmpty(r)) {
                                console.log('Nothing here' + a.txid);
                            } else {
                                a.cancel = true;
                                chronAssign(bn + 200, { op: 'check', agent: r.reject[0], txid: r.txid + ':cancel', acc: from, id: txid })
                                    .then(empty => {
                                        ops.push({ type: 'put', path: ['contracts', from, r.txid], data: a });
                                        ops.push({ type: 'put', path: ['escrow', r.reject[0], r.txid + ':cancel'], data: r.reject[1] });
                                        ops.push({ type: 'del', path: ['dex', 'hbd', 'buyOrders', `${a.rate}:${a.txid}`] });
                                        store.batch(ops, [resolve, reject]);
                                    }).catch(e => { reject(e); });
                            }
                        });
                        break;
                    default:
                        resolve();
                }
            }
        });
    })
}
exports.release = release

function hashThis(data) {
    const digest = crypto.createHash('sha256').update(data).digest()
    const digestSize = Buffer.from(digest.byteLength.toString(16), 'hex')
    const combined = Buffer.concat([hashFunction, digestSize, digest])
    const multihash = bs58.encode(combined)
    return multihash.toString()
}
exports.hashThis = hashThis

function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) return false;
    }
    return true
}
exports.isEmpty = isEmpty;

function signedBy(op, Sig, keys){
    let signed = false
    const sig = Signature.fromString(Sig);
    const digest = cryptoUtils.transactionDigest(op);
    const key = (new Signature(sig.data, sig.recovery)).recover(digest);
    const publicKey = key.toString()
    for(i in keys){
        if(i === publicKey){
            signed = i
            break
        }    
    }
    return signed
}
exports.signedBy = signedBy

function broadcast(op){
    return new Promise((resolve, reject) => {
        const client = new dhive.Client(config.clientURL);

        client.broadcast.send(stx)
            .then(r=>resolve(r)) //I guess log this?
            .catch(e=>reject(e)) //loop different API?
    })
}

exports.broadcast = broadcast

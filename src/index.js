// @flow
import 'proxy-polyfill';

type ProxyTraps<T> = Proxy$traps<T>;

const trapWrapper = <F: $Values<ProxyTraps<any>>>(fn: F, context: {}): F =>
    ((...args: *): * => (fn: any).apply(context, args): any);

const wrapTraps = <T: ProxyTraps<any>>(traps: T, context: {}): T => {
    const result = {};

    for (const [trap, handler] of Object.entries(traps)) {
        result[trap] = trapWrapper((handler: any), context);
    }

    return (result: any);
};

export const contextProxy = <S: {}>(target: S, traps: ProxyTraps<S>, context: {}): S => {
    return new Proxy(target, wrapTraps(traps, context));
};

export default contextProxy;

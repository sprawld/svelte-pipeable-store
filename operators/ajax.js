

export function ajax(url, options) {

    if (AbortController) {

        const controller = new AbortController();
        const signal = controller.signal;

        let promise = fetch(url, {...options, signal});
        promise.cancel = () => {
            controller.abort();
        };
        return promise;
    } else {

        let abort;
        let promise = new Promise((resolve, reject) => {
            abort = reject;
            fetch(url, options).then(res => {
                if(abort) {
                    resolve(res);
                    abort = null;
                }
            }, err => {
                if(abort) {
                    reject(err);
                    abort = null;
                }
            })
        });
        promise.cancel = () => {
            if(abort) {
                abort(new Error('AbortError'));
                abort = null;
            }
        };
        return promise;

    }

}

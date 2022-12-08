async function request(native: Function, hasLoaded: Function, name: string, timeout: number = 500): Promise<boolean> {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            native()
            for (let i = 0; i < timeout; i++) {
                Wait(0)

                if (hasLoaded(name)) {
                    resolve(true)
                }
            }

            reject(false)
        })
        reject(false)
    })
}

export async function RequestAnimationDict(dict: string): Promise<boolean | string> {
    if (!DoesAnimDictExist(dict)) return false
    if (HasAnimDictLoaded(dict)) return true

    return request(RequestAnimationDict, HasAnimDictLoaded, dict)
}

export async function RequestAnimation(animation: string) {
    if (HasAnimSetLoaded(animation)) return true
    return request(RequestAnimSet, HasAnimSetLoaded, animation)
}

export async function PlayAnimation(
    wait: number,
    dict: string,
    animation: string,
    blendIn: number,
    blendOut: number,
    duration: number,
    flag: number,
    rate: number,
    lockX: boolean,
    lockY: boolean,
    lockZ: boolean
) {
    await RequestAnimationDict(dict)
    setImmediate(() => {
        TaskPlayAnim(PlayerPedId(), dict, animation, blendIn, blendOut, duration, flag, rate, lockX, lockY, lockZ)
        Wait(wait)
        if (wait > 0) ClearPedSecondaryTask(PlayerPedId())
    })
}

export async function PlayAnimationAdvanced(
    wait: number,
    dict: string,
    animation: string,
    posX: number,
    posY: number,
    posZ: number,
    rotX: number,
    rotY: number,
    rotZ: number,
    animEnter: number,
    animExit: number,
    duration: number,
    flag: number,
    time: number
) {
    await RequestAnimationDict(dict)
    setImmediate(() => {
        TaskPlayAnimAdvanced(
            PlayerPedId(),
            dict,
            animation,
            posX,
            posY,
            posZ,
            rotX,
            rotY,
            rotZ,
            animEnter,
            animExit,
            duration,
            flag,
            time,
            0,
            0
        )
        Wait(wait)
        if (wait > 0) ClearPedSecondaryTask(PlayerPedId())
    })
}

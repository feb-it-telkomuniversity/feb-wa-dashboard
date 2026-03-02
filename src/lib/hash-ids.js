import Hashids from 'hashids';

const salt = process.env.NEXT_PUBLIC_HASH_SALT || "mira-feb-salt-fallback";
const hashids = new Hashids(salt, 16);

export function encodeId(id) {
    if (!id) return id;
    const numId = Number(id);
    return isNaN(numId) ? id : hashids.encode(numId);
}

export function decodeId(hashedId) {
    if (!hashedId) return null;
    try {
        const decoded = hashids.decode(hashedId);
        return decoded.length > 0 ? decoded[0] : hashedId;
    } catch (e) {
        return hashedId;
    }
}
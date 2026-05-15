import redis from "../config/redis.js";

export const WORKSHOP_CACHE_INDEX_KEY = "workshop:index";

export const getWorkshopInfoKey = (workshopId) => `workshop-${workshopId}-info`;

export const getWorkshopSlotsKey = (workshopId) =>
  `workshop-${workshopId}-slots`;

const toIsoString = (value) => {
  if (!value) return "";
  return new Date(value).toISOString();
};

const stringify = (value) => JSON.stringify(value ?? {});

const parseJson = (value, fallback) => {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const getCacheTtlSeconds = (registrationEndTime) => {
  if (!registrationEndTime) return null;

  const ttl = Math.ceil(
    (new Date(registrationEndTime).getTime() - Date.now()) / 1000,
  );

  return ttl > 0 ? ttl : null;
};

const serializeWorkshop = (workshop) => {
  const id = workshop.id ?? workshop.workshopId;

  return {
    id: String(id),
    title: workshop.title ?? "",
    description: workshop.description ?? "",
    aiSummary: workshop.aiSummary ?? "",
    summaryStatus: workshop.summaryStatus ?? "",
    speaker: stringify(workshop.speaker),
    room: workshop.room ?? "",
    roomDiagram: stringify(workshop.roomDiagram),
    startTime: toIsoString(workshop.startTime),
    endTime: toIsoString(workshop.endTime),
    registrationStartTime: toIsoString(workshop.registrationStartTime),
    registrationEndTime: toIsoString(workshop.registrationEndTime),
    capacity: String(workshop.capacity ?? 0),
    price: String(workshop.price ?? 0),
    createdBy: String(workshop.createdBy ?? ""),
    cachedAt: new Date().toISOString(),
  };
};

const deserializeWorkshop = (hash) => {
  if (!hash || Object.keys(hash).length === 0) return null;

  return {
    id: hash.id,
    title: hash.title,
    description: hash.description,
    aiSummary: hash.aiSummary,
    summaryStatus: hash.summaryStatus,
    speaker: parseJson(hash.speaker, {}),
    room: hash.room,
    roomDiagram: parseJson(hash.roomDiagram, {}),
    startTime: hash.startTime,
    endTime: hash.endTime,
    registrationStartTime: hash.registrationStartTime,
    registrationEndTime: hash.registrationEndTime,
    capacity: Number.parseInt(hash.capacity, 10) || 0,
    price: Number.parseFloat(hash.price) || 0,
    createdBy: hash.createdBy,
    cachedAt: hash.cachedAt,
  };
};

const getActiveCachedWorkshopIds = async () => {
  const workshopIds = await redis.sMembers(WORKSHOP_CACHE_INDEX_KEY);
  const activeWorkshopIds = [];
  const staleWorkshopIds = [];

  await Promise.all(
    workshopIds.map(async (workshopId) => {
      const hasWorkshopInfo =
        (await redis.exists(getWorkshopInfoKey(workshopId))) === 1;

      if (hasWorkshopInfo) {
        activeWorkshopIds.push(workshopId);
      } else {
        staleWorkshopIds.push(workshopId);
      }
    }),
  );

  if (staleWorkshopIds.length > 0) {
    await redis.sRem(WORKSHOP_CACHE_INDEX_KEY, staleWorkshopIds);
  }

  return activeWorkshopIds;
};

export const workshopCacheService = {
  cacheWorkshopForRegistration: async (workshop) => {
    const workshopId = workshop.id ?? workshop.workshopId;
    if (!workshopId) {
      throw new Error("Workshop id is required to cache workshop");
    }

    const infoKey = getWorkshopInfoKey(workshopId);
    const slotsKey = getWorkshopSlotsKey(workshopId);
    const ttlSeconds = getCacheTtlSeconds(workshop.registrationEndTime);
    const tx = redis.multi();

    tx.hSet(infoKey, serializeWorkshop(workshop));
    tx.set(slotsKey, String(workshop.availableSlots ?? workshop.capacity ?? 0));
    tx.sAdd(WORKSHOP_CACHE_INDEX_KEY, String(workshopId));

    if (ttlSeconds) {
      tx.expire(infoKey, ttlSeconds);
      tx.expire(slotsKey, ttlSeconds);
    }

    await tx.exec();

    return {
      infoKey,
      slotsKey,
    };
  },

  getCachedWorkshop: async (workshopId) => {
    const hash = await redis.hGetAll(getWorkshopInfoKey(workshopId));
    return deserializeWorkshop(hash);
  },

  getCachedWorkshopIds: async () => getActiveCachedWorkshopIds(),

  getCachedWorkshops: async () => {
    const workshopIds = await getActiveCachedWorkshopIds();
    const workshops = await Promise.all(
      workshopIds.map(async (workshopId) => {
        const hash = await redis.hGetAll(getWorkshopInfoKey(workshopId));
        return deserializeWorkshop(hash);
      }),
    );

    return workshops.filter(Boolean);
  },

  hasCachedSlots: async (workshopId) => {
    return (await redis.exists(getWorkshopSlotsKey(workshopId))) === 1;
  },
};

import {chunk, compact, flatten, head, isEmpty, reduce, sortBy, uniqBy} from "lodash";
import {atom, selector, selectorFamily} from "recoil";
import {EngineState} from "./engine";
import {PeriodResolverState} from "./period";
import {ScorecardDataSourceState, ScorecardViewState} from "./scorecard";
import {UserState} from "./user";
const {atomFamily} = require("recoil");

const orgUnitQuery = {
    orgUnit: {
        resource: "organisationUnits",
        id: ({id}) => id,
        params: {
            fields: ["id", "displayName", "path", "level"],
        },
    },
};

const orgUnitChildrenQuery = {
    orgUnit: {
        resource: "organisationUnits",
        id: ({id}) => id,
        params: {
            fields: ["children[level,id,displayName,path]"],
        },
    },
};

const selectedOrgUnitsQuery = {
    orgUnits: {
        resource: "analytics",
        params: ({ids, pe}) => ({
            dimension: `ou:${ids.join(";")},pe:${pe}`,
            skipData: true,
            hierarchyMeta: true,
            showHierarchy: true,
        }),
    },
};

const orgUnitLevelsQuery = {
    levels: {
        resource: "organisationUnitLevels",
        params: {
            fields: ["id", "displayName", "level"],
        },
    },
};
const orgUnitGroupsQuery = {
    groups: {
        resource: "organisationUnitGroups",
        params: {
            fields: ["id", "displayName"],
        },
    },
};

export const OrgUnitLevels = atom({
    key: "org-unit-levels",
    default: selector({
        key: "org-unit-levels-default",
        get: async ({get}) => {
            const engine = get(EngineState);
            const {levels} = await engine.query(orgUnitLevelsQuery);
            return levels?.organisationUnitLevels;
        },
    }),
});
export const OrgUnitGroups = atom({
    key: "org-unit-group",
    default: selector({
        key: "org-unit-group-default",
        get: async ({get}) => {
            const engine = get(EngineState);
            const {groups} = await engine.query(orgUnitGroupsQuery);
            return groups?.organisationUnitGroups;
        },
    }),
});

export const OrgUnits = selectorFamily({
    key: "orgUnitSelector",
    get:
        (id) =>
            async ({get}) => {
                try {
                    const engine = get(EngineState);
                    const {orgUnit} = await engine.query(orgUnitQuery, {
                        variables: {id},
                    });
                    return orgUnit;
                } catch (e) {
                    return {};
                }
            },
});

export const OrgUnitPathState = atomFamily({
    key: "orgUnitPath",
    default: selectorFamily({
        key: "orgUnitPathSelector",
        get:

            (path = "") =>
                async ({get}) => {
                    const orgUnits = compact(path.split("/"));
                    const orgUnitNames = sortBy(
                        get(SelectedOrgUnits(orgUnits)),
                        "level"
                    )?.map(({displayName}) => displayName);
                    return orgUnitNames.join("/");
                },
    }),
})

export const OrgUnitChildren = selectorFamily({
    key: "orgUnitChildren",
    get:
        (orgUnitId) =>
            async ({get}) => {
                const engine = get(EngineState);
                const {orgUnit} = await engine.query(orgUnitChildrenQuery, {
                    variables: {id: orgUnitId},
                });

                return orgUnit?.children ?? [];
            },
});

export const LowestOrgUnitLevel = selector({
    key: "last-org-unit-level",
    get: ({get}) => {
        const orgUnitLevels = get(OrgUnitLevels);
        return reduce(orgUnitLevels, (acc, level) => (level.level > acc.level ? level : acc));
    },
});


const userSubUnitsQuery = {
    ou: {
        resource: "analytics",
        params: ({pe, dx, ou}) => ({
            dimension: [`ou:${ou}`, `pe:${pe}`, `dx:${dx}`],
            skipData: true,
            hierarchyMeta: true,
            showHierarchy: true,
        }),
    },
};

const getOrgUnitsFromAnalytics = (analytics) => {
    const {metadata} = analytics ?? {};
    const {dimensions, ouNameHierarchy, items, ouHierarchy} = metadata ?? {};

    const ous = dimensions?.ou ?? [];

    return ous.map(ouId => {
        const ou = items[ouId];
        const hierarchy = ouNameHierarchy[ouId];
        const path = ouHierarchy[ouId];
        const {name} = ou ?? {};
        return {
            id: ouId,
            displayName: name,
            hierarchy,
            path
        };
    })
}

export const InitialOrgUnits = selector({
    key: "initial-org-units-resolver",
    get: async ({get}) => {
        const {
            orgUnits,
            levels,
            groups,
            userOrgUnit,
            userSubUnit,
            userSubX2Unit,
        } = get(ScorecardViewState("orgUnitSelection"));
        const periods = get(PeriodResolverState) ?? [];
        const dataHolders = get(ScorecardDataSourceState) ?? [];
        const {organisationUnits} = get(UserState);
        const engine = get(EngineState);

        let resolvedOrgUnits = orgUnits;

        if (!isEmpty(dataHolders) && !isEmpty(periods)) {
            if (userSubX2Unit) {
                const {ou} = await engine.query(userSubUnitsQuery, {
                    variables: {
                        pe: head(periods)?.id,
                        dx: head(head(dataHolders)?.dataSources)?.id,
                        ou: "USER_ORGUNIT_GRANDCHILDREN",
                    },
                });
                resolvedOrgUnits = [
                    ...resolvedOrgUnits,
                    ...getOrgUnitsFromAnalytics(ou),
                ];
            }
            if (userSubUnit) {
                const {ou} = await engine.query(userSubUnitsQuery, {
                    variables: {
                        pe: head(periods)?.id,
                        dx: head(head(dataHolders)?.dataSources)?.id,
                        ou: "USER_ORGUNIT_CHILDREN",
                    },
                });
                resolvedOrgUnits = [
                    ...resolvedOrgUnits,
                    ...getOrgUnitsFromAnalytics(ou),
                ];
            }
            if (userOrgUnit) {
                resolvedOrgUnits = [...resolvedOrgUnits, ...organisationUnits];
            }

            if (!isEmpty(levels)) {
                const {ou} = await engine.query(userSubUnitsQuery, {
                    variables: {
                        pe: head(periods)?.id,
                        dx: head(head(dataHolders)?.dataSources)?.id,
                        ou: levels?.map((level) => `LEVEL-${level}`)?.join(";"),
                    },
                });
                resolvedOrgUnits = [
                    ...resolvedOrgUnits,
                    ...getOrgUnitsFromAnalytics(ou),
                ];
            }

            if (!isEmpty(groups)) {
                const {ou} = await engine.query(userSubUnitsQuery, {
                    variables: {
                        pe: head(periods)?.id,
                        dx: head(head(dataHolders)?.dataSources)?.id,
                        ou: groups?.map((group) => `OU_GROUP-${group}`)?.join(";"),
                    },
                });
                resolvedOrgUnits = [
                    ...resolvedOrgUnits,
                    ...getOrgUnitsFromAnalytics(ou),
                ];
            }
        }
        return {orgUnits: uniqBy(resolvedOrgUnits, "id")};
    },
});


const getOrgUnits = async (engine, periods, orgUnitsIds) => {
    const {orgUnits} = await engine.query(selectedOrgUnitsQuery, {
        variables: {ids: orgUnitsIds ?? [], pe: head(periods)?.id},
    });
    return getOrgUnitsFromAnalytics(orgUnits) ?? [];
}

export const SelectedOrgUnits = selectorFamily({
    key: "selected-org-units-resolver",
    get:
        (orgUnitsIds) =>
            async ({get}) => {
                try {
                    const engine = get(EngineState);
                    const periods = get(PeriodResolverState) ?? []
                    const orgUnitChunks = chunk(orgUnitsIds, 20);
                    const orgUnits = await Promise.all(orgUnitChunks.map((chunk) => getOrgUnits(engine, periods, chunk)));
                    return flatten(orgUnits);
                } catch (e) {
                    console.error(e);
                    return [];
                }
            },
});

export const AnalyticsOrgUnits = selector({
    key: "analytics-org-units-resolver",
    get: ({get}) => {
        const orgUnitSelection = get(ScorecardViewState("orgUnitSelection"));
        const orgUnits = [];

        if (orgUnitSelection.orgUnits) {
            orgUnits.push(...(orgUnitSelection?.orgUnits?.map((ou) => (`${ou.id}`)) ?? []));
        }

        if (orgUnitSelection.levels) {
            orgUnits.push(...(orgUnitSelection?.levels?.map((level) => (`LEVEL-${level}`)) ?? []));
        }

        if (orgUnitSelection.groups) {
            orgUnits.push(...(orgUnitSelection?.groups?.map((group) => (`OU_GROUP-${group}`)) ?? []));
        }

        if (orgUnitSelection.userSubX2Unit) {
            orgUnits.push("USER_ORGUNIT_GRANDCHILDREN");
        }

        if (orgUnitSelection.userSubUnit) {
            orgUnits.push("USER_ORGUNIT_CHILDREN");
        }

        if (orgUnitSelection.userOrgUnit) {
            orgUnits.push("USER_ORGUNIT");
            if (!orgUnits.includes("USER_ORGUNIT_CHILDREN") && orgUnits.length === 1) {
                orgUnits.push("USER_ORGUNIT_CHILDREN");
            }
        }

        if (orgUnits.length === 1) {
            const orgUnit = get(OrgUnits(orgUnits[0]));
            if (orgUnit) {
                orgUnits.push(orgUnit.id)
                orgUnits.push(`LEVEL-${orgUnit.level + 1}`);
            }
        }

        return orgUnits;
    }
})


import {find} from "lodash";
import {atom, selector, selectorFamily} from "recoil";
import {DefaultAuthority} from "@hisptz/scorecard-constants";
import {EngineState} from "./engine";
import {ScorecardSummaryState} from "./scorecard";
import {getUserAuthority} from "@hisptz/scorecard-utils/src";

const userQuery = {
    user: {
        resource: "me",
        params: {
            fields: [
                "id",
                "displayName",
                "userGroups",
                "authorities",
                "organisationUnits[id,level,displayName]",
            ],
        },
    },
};

export const UserState = atom({
    key: "userState",
    default: selector({
        key: "userStateSelector",
        get: async ({get}) => {
            try {
                const engine = get(EngineState);
                if (engine) {
                    const {user} = await engine.query(userQuery);
                    if (user) {
                        return user;
                    }
                    return null;
                }
            } catch (e) {
                console.error(e);
            }
        },
    }),
});

export const UserAuthorityOnScorecard = selectorFamily({
    key: "user-scorecard-authority",
    get:
        (scorecardId) =>
            ({get}) => {
                const scorecardSummary = find(get(ScorecardSummaryState), [
                    "id",
                    scorecardId,
                ]);
                const user = get(UserState);
                return getUserAuthority(user, scorecardSummary) ?? DefaultAuthority;
            },
});

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useFrens } from "../api";
import frensTableStyles from "../styles/FrensTable.module.css";
import { usePrevious } from "../utils/hooks";

export default function FrensTable({ searchInput, page, showFixed }) {
  const {
    data: frensData,
    error,
    isValidating,
  } = useFrens({
    searchInput,
    page,
  });
  const prevFrensData = usePrevious(frensData);
  const { frens } = frensData || prevFrensData || {};

  if (error != null)
    return (
      <div style={{ width: "100%", textAlign: "center" }}>
        There was an error.
      </div>
    );

  return (
    <AnimatePresence exitBeforeEnter>
      <motion.div
        animate={isValidating && !frensData ? "loading" : "loaded"}
        key={frens.length > 0 ? frens[0].id : "empty"}
        initial={{ opacity: 1, filter: "blur(5px) brightness(1.05)" }}
        exit={{ opacity: 0.2, filter: "blur(5px) brightness(1.05)" }}
        enter={{ opacity: 0.2, filter: "blur(5px) brightness(1.05)" }}
        variants={{
          loading: () => ({
            opacity: 0.2,
            filter: "blur(5px) brightness(1.05)",
          }),
          loaded: {
            opacity: 1,
            filter: "blur(0px) brightness(1)",
          },
        }}
      >
        <FrensTablePage frens={frens} showFixed={showFixed} />
      </motion.div>
    </AnimatePresence>
  );
}

const FrensTablePage = ({ frens, showFixed }) => {
  return (
    <div
      className={`${frensTableStyles.tableWrapper} ${
        frens.length > 0 ? "" : frensTableStyles.noResultsWrapper
      }`}
    >
      {frens.length > 0 ? (
        <table className={frensTableStyles.profiles}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Twitter</th>
              <th>Followers</th>
            </tr>
          </thead>
          <tbody>
            {frens.map((fren, inx) => (
              <tr
                key={fren.id}
                data-verified={fren.verified}
                data-avatar={
                  fren.ensAvatar && !fren.ensAvatar.includes("default")
                }
              >
                <td>
                  {fren.ranking.toLocaleString("en", { useGrouping: true })}
                </td>
                <td>
                  {fren.ens === ".eth" ? (
                    fren.name
                  ) : (
                    <a
                      className={frensTableStyles.ensProfile}
                      href={`https://${fren.ens}.xyz`}
                      target="_blank"
                    >
                      <Image
                        layout="fixed"
                        width="34px"
                        height="34px"
                        className={frensTableStyles.pfp}
                        src={
                          "https://metadata.ens.domains/mainnet/avatar/" +
                          fren.ens
                        }
                        alt=""
                        priority={inx < 10}
                      />
                      <span className={frensTableStyles.ensName}>
                        {fren.ens}
                      </span>
                      <svg
                        width="16"
                        height="15"
                        viewBox="0 0 16 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          opacity="0.3"
                          d="M7.95739 14.7955L15.1165 7.63636L7.95739 0.477273L6.30966 2.1179L10.6349 6.43608H0.5V8.83665H10.6349L6.30966 13.1619L7.95739 14.7955Z"
                          fill="black"
                        />
                      </svg>
                    </a>
                  )}
                </td>
                <td>
                  <a
                    className={frensTableStyles.ensProfile}
                    href={"https://twitter.com/" + fren.handle}
                    target="_blank"
                  >
                    <Image
                      layout="fixed"
                      width="34px"
                      height="34px"
                      className={frensTableStyles.pfp}
                      src={
                        fren.twitterPicture ||
                        "https://unavatar.io/twitter/" +
                          fren.handle +
                          "?fallback=false"
                      }
                      alt=""
                      priority={inx < 10}
                    />
                    <span className={frensTableStyles.ensName}>
                      {"@" + fren.handle}
                    </span>
                  </a>
                </td>
                <td>{fren.followers.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className={frensTableStyles.noResults}>
          No matches found.
          <span>
            Looking for someone with a .eth name on Twitter? <br />
            <a
              href="https://twitter.com/intent/tweet?text=%40ethleaderboard%20add"
              target="_blank"
            >
              Tweet at @ethleaderboard
            </a>{" "}
            and they'll be added shortly.
          </span>
        </div>
      )}
    </div>
  );
};

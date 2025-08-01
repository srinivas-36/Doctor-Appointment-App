import { useContext, useState, useEffect } from "react";
import { authContext } from "../../context/authContext.jsx";
import { toast } from "react-toastify";
import useGetProfile from "../../hooks/useFetchdata.jsx";
import { BASE_URL } from "../../config.js";
import MyBookings from "./MyBookings.jsx";
import ProfileSettings from "./ProfileSettings.jsx";
import Loading from "../../components/loader/Loading.jsx";
import Error from "../../components/Error/Error.jsx";

const MyAccount = () => {
  const { dispatch, user: authUser } = useContext(authContext);
  const [tab, setTab] = useState("bookings");
  const {
    data: fetchedUserData,
    loading,
    error,
  } = useGetProfile(`${BASE_URL}/users/profile/me`);

  // Local state to manage merged data
  const [userData, setUserData] = useState(authUser);

  // Update local data when either fetched data or auth context changes
  useEffect(() => {
    if (fetchedUserData) {
      setUserData({
        ...fetchedUserData,
        photo: authUser?.photo || fetchedUserData.photo, // Prioritize photo from auth context
      });
    }
    if (authUser) {
      setUserData(authUser);
    }
  }, [fetchedUserData, authUser]);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });

    toast.success("Logged out successfully !!");
  };

  return (
    <section>
      <div className="max-w-[1170px] px-5 mx-auto">
        {loading && !error && <Loading />}
        {error && !loading && <Error errMessage={error} />}

        {!loading && !error && userData && (
          <div className="grid md:grid-cols-3 gap-10">
            <div className="pb-[50px] px-[30px] rounded-md">
              <div className="flex items-center justify-center">
                <figure className="w-[100px] h-[100px] rounded-full border-2 border-solid border-primaryColor">
                  <img
                    src={userData.photo}
                    alt=""
                    className="w-full h-full rounded-full"
                  />
                </figure>
              </div>

              <div className="text-center mt-4">
                <h3 className="text-[18px] leading-[30px] text-headingColor font-bold ">
                  {userData.name}
                </h3>
                <p className="text-textColor text-[15px] leading-6 font-medium">
                  {userData.email}
                </p>
                <p className="text-textColor text-[15px] leading-6 font-medium">
                  Blood Type:{" "}
                  <span className="ml-2 text-headingColor text-[22px] leading-8">
                    {userData.bloodType}
                  </span>
                </p>
              </div>

              <div className="mt-[50px] md:mt-[100px]">
                <button
                  className="w-full bg-[#181A1E] p-3 text-[16px] leading-7 rounded-md text-white"
                  onClick={handleLogout}
                >
                  Logout
                </button>
                <button className="w-full bg-red-600 mt-4 p-3 text-[16px] leading-7 rounded-md text-white">
                  Delete Account
                </button>
              </div>
            </div>

            <div className="md:col-span-2 md:px-[30px]">
              <div>
                <button
                  onClick={() => setTab("bookings")}
                  className={`${tab === "bookings" &&
                    "bg-primaryColor text-white font-normal"
                    } p-2 mt-3 mr-5 rounded-md text-headingColor font-semibold text-[16px] leading-7 border border-solid border-primaryColor`}
                >
                  My Bookings
                </button>
                <button
                  onClick={() => setTab("settings")}
                  className={` ${tab === "settings" &&
                    "bg-primaryColor text-white font-normal"
                    } p-2 mr-5 rounded-md text-headingColor font-semibold text-[16px] leading-7 border border-solid border-primaryColor`}
                >
                  Profile Settings
                </button>
              </div>

              {tab === "bookings" && <MyBookings />}
              {tab === "settings" && <ProfileSettings user={userData} />}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyAccount;

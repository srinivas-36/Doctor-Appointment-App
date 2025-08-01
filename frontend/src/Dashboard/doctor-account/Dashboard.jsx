import React, { useState, useContext, useEffect } from "react";
import Loader from "../../components/loader/Loading.jsx";
import Error from "../../components/Error/Error.jsx";
import useGetProfile from "../../hooks/useFetchdata.jsx";
import { BASE_URL } from "../../config";
import Tabs from "./Tabs.jsx";
import starIcon from "../../assets/images/Star.png";
import DoctorAbout from "../../pages/Doctors/DoctorsAbout.jsx";
import Profile from "./Profile.jsx";
import Appointments from "./Appointments.jsx";
import { authContext } from "../../context/authContext.jsx";

const Dashboard = () => {
  const {
    data: fetchedData,
    loading,
    error,
  } = useGetProfile(`${BASE_URL}/doctors/profile/me`);
  const { user } = useContext(authContext);
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("overview");

  // Update local data when either fetched data or user context changes
  useEffect(() => {
    if (fetchedData) {
      // Merge fetched data with any updates from auth context
      setData({
        ...fetchedData,
        photo: user?.photo || fetchedData.photo, // Prioritize photo from auth context
      });
    }
  }, [fetchedData, user]);
  const [newBookingsCount, setNewBookingsCount] = useState(0);

  // Add this useEffect
  useEffect(() => {
    if (data?.appointments) {
      const count = data.appointments.filter(appt =>
        appt.status === 'approved' &&
        appt.isPaid &&
        (!appt.lastViewedByDoctor || new Date(appt.createdAt) > new Date(appt.lastViewedByDoctor))
      ).length;
      setNewBookingsCount(count);
    }
  }, [data]);
  useEffect(() => {
    const resetUnreadForAll = async () => {
      if (tab === "appointments" && data?.appointments?.length > 0) {
        try {
          const unseenIds = data.appointments
            .filter(appt =>
              appt.status === 'approved' &&
              appt.isPaid &&
              (!appt.lastViewedByDoctor || new Date(appt.createdAt) > new Date(appt.lastViewedByDoctor))
            )
            .map(appt => appt._id);

          if (unseenIds.length > 0) {
            await fetch(`${BASE_URL}/bookings/reset-unread-batch`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ bookingIds: unseenIds }),
            });

            setNewBookingsCount(0);
          }
        } catch (err) {
          console.error("Failed to reset unread counters:", err);
        }
      }
    };

    resetUnreadForAll();
  }, [tab, data]);




  return (
    <section>
      <div className="max-w-[1100px] px-5 mx-auto">
        {loading && !error && <Loader />}
        {error && !loading && <Error />}

        {!loading && !error && data && (
          <div className="flex flex-col lg:flex-row gap-[30px] lg:gap-[50px]">
            <div className="lg:w-1/3">
              <Tabs tab={tab} setTab={setTab} newBookingsCount={newBookingsCount} />

            </div>

            <div className="lg:w-2/3">
              {data.isApproved === "pending" && (
                <div className="flex p-4 mb-4 text-yellow-800 bg-yellow-50 rounded-lg">
                  <svg
                    aria-hidden="true"
                    className="flex-shrink-0 w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.x3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 l 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    ></path>
                  </svg>

                  <span className="sr-only">Info</span>
                  <div className="ml-3 text-sm font-medium">
                    To get approval please complete your profile. We'll review
                    manually and approve within 3 days.
                  </div>
                </div>
              )}

              <div className="mt-8">
                {tab === "overview" && (
                  <div>
                    <div className="flex items-center gap-4 mb-10">
                      <figure className="max-w-[200px] max-h-[200px]">
                        <img src={data?.photo} alt="" className="w-full" />
                      </figure>
                      <div>
                        <span className="bg-[#CCF0F3] text-irisBlueColor py-1 px-4 lg:py-2 lg:px-6 rounded text-[12px] leading-4 lg:text-[16px] lg:leading-6 font-semibold">
                          {data.specialization}
                        </span>

                        <h3 className="text-[22px] leading-9 font-bold text-headingColor mt-3">
                          {data.name}
                        </h3>

                        <div className="flex items-center gap-[6px]">
                          <span className="flex items-center gap-[6px] text-headingColor text-[14px] leading-5 lg:text-[16px] lg:leading-6 font-semibold">
                            <img src={starIcon} alt="" />
                            {Math.round(data.averageRating, 2)}
                          </span>
                          <span className="text-textColor text-[14px] leading-5 lg:text-[16px] lg:leading-6 font-semibold">
                            ({data.totalRating})
                          </span>
                        </div>

                        <p className="text__para font-[15px] lg:max-w-[390px] leading-6">
                          {data?.bio}
                        </p>
                      </div>
                    </div>
                    <DoctorAbout
                      name={data.name}
                      about={data.about}
                      qualifications={data.qualifications}
                      experiences={data.experiences}
                    />
                  </div>
                )}
                {tab === "appointments" && (
                  <Appointments appointments={data.appointments} />
                )}
                {tab === "settings" && (
                  <div>
                    <Profile doctorData={data} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;

import { useEffect, useState, useContext } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import uploadImageToCloudinary from "../../utils/uploadCloudinary.js";
import { BASE_URL, token } from "../../config.js";
import { toast } from "react-toastify";
import axios from "axios";
import { authContext } from "../../context/authContext.jsx";

const Profile = ({ doctorData }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: doctorData.email,
    password: doctorData.password,
    phone: "",
    bio: doctorData.bio,
    gender: "",
    specialization: "",
    ticketPrice: doctorData.ticketPrice,
    qualifications: [],
    experiences: [],
    timeSlots: [],
    about: doctorData.about,
    photo: null,
  });

  const [timeSlotState, setTimeSlotState] = useState({
    selectedDay: "",
    startingTime: "",
    endingTime: "",
    daysToApply: [],
  });

  const { updateUser } = useContext(authContext);

  useEffect(() => {
    setFormData({
      name: doctorData?.name,
      email: doctorData?.email,
      password: doctorData?.password,
      phone: doctorData?.phone,
      bio: doctorData?.bio,
      gender: doctorData?.gender,
      specialization: doctorData?.specialization,
      ticketPrice: doctorData.ticketPrice,
      qualifications: doctorData?.qualifications,
      experiences: doctorData?.experiences,
      timeSlots: doctorData?.timeSlots,
      about: doctorData.about,
      photo: doctorData?.photo,
    });
  }, [doctorData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "ticketPrice" ? parseFloat(value) : value,
    });
  };

  const handleFileInputChange = async (event) => {
    const file = event.target.files[0];
    const data = await uploadImageToCloudinary(file);
    setFormData({ ...formData, photo: data?.url });
  };

  const updateProfileHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${BASE_URL}/doctors/${doctorData._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      updateUser(response.data.data);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  // Time slot related functions
  const handleTimeSlotDayChange = (e) => {
    const { value } = e.target;
    setTimeSlotState({
      ...timeSlotState,
      selectedDay: value,
      daysToApply: timeSlotState.daysToApply.includes(value)
        ? timeSlotState.daysToApply
        : [...timeSlotState.daysToApply, value]
    });
  };

  const handleTimeSlotTimeChange = (e) => {
    const { name, value } = e.target;
    setTimeSlotState({ ...timeSlotState, [name]: value });
  };

  const toggleDaySelection = (day) => {
    setTimeSlotState(prev => ({
      ...prev,
      daysToApply: prev.daysToApply.includes(day)
        ? prev.daysToApply.filter(d => d !== day)
        : [...prev.daysToApply, day]
    }));
  };

  const addTimeSlot = (e) => {
    e.preventDefault();

    if (!timeSlotState.startingTime || !timeSlotState.endingTime) {
      toast.error("Please select both starting and ending times");
      return;
    }

    if (timeSlotState.daysToApply.length === 0) {
      toast.error("Please select at least one day");
      return;
    }

    const newSlots = timeSlotState.daysToApply.map(day => ({
      day: day,
      startingTime: timeSlotState.startingTime,
      endingTime: timeSlotState.endingTime,
      isAvailable: true
    }));

    setFormData(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, ...newSlots]
    }));

    // Reset time inputs but keep selected days
    setTimeSlotState(prev => ({
      ...prev,
      startingTime: "",
      endingTime: ""
    }));
  };

  const deleteTimeSlot = (e, index) => {
    e.preventDefault();
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index)
    }));
  };

  // Reusable functions for qualifications and experiences
  const addItem = (key, item) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      [key]: [...prevFormData[key], item],
    }));
  };

  const deleteItem = (key, index) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      [key]: prevFormData[key].filter((_, i) => i !== index),
    }));
  };

  const handleReusableInputChangeFunc = (key, index, event) => {
    const { name, value } = event.target;
    setFormData(prevFormData => {
      const updateItems = [...prevFormData[key]];
      updateItems[index][name] = value;
      return {
        ...prevFormData,
        [key]: updateItems,
      };
    });
  };

  const addQualification = (e) => {
    e.preventDefault();
    addItem("qualifications", {
      startingDate: "",
      endingDate: "",
      degree: "PHD",
      university: "Usmonia medical college",
    });
  };

  const handleQualificationChange = (event, index) => {
    handleReusableInputChangeFunc("qualifications", index, event);
  };

  const deleteQualification = (e, index) => {
    e.preventDefault();
    deleteItem("qualifications", index);
  };

  const addExperience = (e) => {
    e.preventDefault();
    addItem("experiences", {
      startingDate: "",
      endingDate: "",
      position: "Senior Surgeon",
      hospital: "Usomonia Medical",
    });
  };

  const handleExperienceChange = (event, index) => {
    handleReusableInputChangeFunc("experiences", index, event);
  };

  const deleteExperience = (e, index) => {
    e.preventDefault();
    deleteItem("experiences", index);
  };

  return (
    <div>
      <h2 className="text-headingColor font-bold text-[24px] leading-9 mb-10">
        Profile Information
      </h2>

      <form>
        <div className="mb-5">
          <p className="form__label">Name*</p>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Full name"
            className="form__input"
          />
        </div>
        <div className="mb-5">
          <p className="form__label">Email*</p>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            className="form__input"
            readOnly
            aria-readonly
            disabled
          />
        </div>
        <div className="mb-5">
          <p className="form__label">Password*</p>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            className="form__input"
            readOnly
            aria-readonly
            disabled
          />
        </div>
        <div className="mb-5">
          <p className="form__label">Phone*</p>
          <input
            type="number"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Phone No"
            className="form__input"
          />
        </div>
        <div className="mb-5">
          <p className="form__label">Bio</p>
          <input
            type="text"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Bio"
            className="form__input"
          />
        </div>

        <div className="mb-5">
          <div className="grid grid-cols-3 gap-5 mb-[30px]">
            <div>
              <p className="form__label">Gender*</p>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="form__input py-3.5"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Others</option>
              </select>
            </div>
            <div>
              <p className="form__label">Specialization*</p>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                className="form__input py-3.5"
              >
                <option value="">Select</option>
                <option value="surgeon">Surgeon</option>
                <option value="neurologist">Neurologist</option>
                <option value="dermatologist">Dermatologist</option>
              </select>
            </div>
            <div>
              <p className="form__label">Ticket Price</p>
              <input
                type="number"
                placeholder="100"
                name="ticketPrice"
                value={formData.ticketPrice}
                className="form__input"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="mb-5">
          <p className="form__label">Qualifications*</p>
          {formData.qualifications?.map((item, index) => (
            <div key={index}>
              <div>
                <div className="grid grid-cols-2 gap-5 mb-2">
                  <div>
                    <p className="form__label">Starting Date*</p>
                    <input
                      type="date"
                      name="startingDate"
                      value={item.startingDate}
                      className="form__input"
                      onChange={(e) => handleQualificationChange(e, index)}
                    />
                  </div>
                  <div>
                    <p className="form__label">Ending Date*</p>
                    <input
                      type="date"
                      name="endingDate"
                      value={item.endingDate}
                      className="form__input"
                      onChange={(e) => handleQualificationChange(e, index)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 mt-5">
                  <div>
                    <p className="form__label">Degree*</p>
                    <input
                      type="text"
                      name="degree"
                      value={item.degree}
                      className="form__input"
                      onChange={(e) => handleQualificationChange(e, index)}
                    />
                  </div>
                  <div>
                    <p className="form__label">University*</p>
                    <input
                      type="text"
                      name="university"
                      value={item.university}
                      className="form__input"
                      onChange={(e) => handleQualificationChange(e, index)}
                    />
                  </div>
                </div>

                <button
                  className="bg-red-600 p-2 rounded-full text-white text-[20px] mt-2 mb-[30px] cursor-pointer"
                  onClick={(e) => deleteQualification(e, index)}
                >
                  <AiOutlineDelete />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addQualification}
            className="bg-[#000] py-2 px-5 rounded text-white h-fir cursor-pointer"
          >
            Add Qualification
          </button>
        </div>

        <div className="mb-5">
          <p className="form__label">Experiences*</p>
          {formData.experiences?.map((item, index) => (
            <div key={index}>
              <div>
                <div className="grid grid-cols-2 gap-5 mb-2">
                  <div>
                    <p className="form__label">Starting Date*</p>
                    <input
                      type="date"
                      name="startingDate"
                      value={item.startingDate}
                      className="form__input"
                      onChange={(e) => handleExperienceChange(e, index)}
                    />
                  </div>
                  <div>
                    <p className="form__label">Ending Date*</p>
                    <input
                      type="date"
                      name="endingDate"
                      value={item.endingDate}
                      className="form__input"
                      onChange={(e) => handleExperienceChange(e, index)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 mt-5">
                  <div>
                    <p className="form__label">Position*</p>
                    <input
                      type="text"
                      name="position"
                      value={item.position}
                      className="form__input"
                      onChange={(e) => handleExperienceChange(e, index)}
                    />
                  </div>
                  <div>
                    <p className="form__label">Hospital*</p>
                    <input
                      type="text"
                      name="hospital"
                      value={item.hospital}
                      className="form__input"
                      onChange={(e) => handleExperienceChange(e, index)}
                    />
                  </div>
                </div>

                <button
                  onClick={(e) => deleteExperience(e, index)}
                  className="bg-red-600 p-2 rounded-full text-white text-[20px] mt-2 mb-[30px] cursor-pointer"
                >
                  <AiOutlineDelete />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addExperience}
            className="bg-[#000] py-2 px-5 rounded text-white h-fir cursor-pointer"
          >
            Add Experience
          </button>
        </div>

        <div className="mb-5">
          <p className="form__label">Time Slots*</p>

          {/* Time Slot Day Selection */}
          <div className="mb-4">
            <p className="form__label">Select Day(s)*</p>
            <select
              name="selectedDay"
              value={timeSlotState.selectedDay}
              onChange={handleTimeSlotDayChange}
              className="form__input py-3.5 mb-2"
            >
              <option value="">Select Day</option>
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
            </select>

            {/* Selected Days */}
            {timeSlotState.daysToApply.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {timeSlotState.daysToApply.map(day => (
                  <span
                    key={day}
                    className="bg-primaryColor text-white px-3 py-1 rounded-full flex items-center gap-1 cursor-pointer"
                    onClick={() => toggleDaySelection(day)}
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                    <span className="text-xs">×</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Time Slot Time Selection */}
          <div className="grid grid-cols-2 gap-5 mb-4">
            <div>
              <p className="form__label">Starting Time*</p>
              <input
                type="time"
                name="startingTime"
                value={timeSlotState.startingTime}
                onChange={handleTimeSlotTimeChange}
                className="form__input"
              />
            </div>
            <div>
              <p className="form__label">Ending Time*</p>
              <input
                type="time"
                name="endingTime"
                value={timeSlotState.endingTime}
                onChange={handleTimeSlotTimeChange}
                className="form__input"
              />
            </div>
          </div>

          {/* Add Time Slot Button */}
          <button
            onClick={addTimeSlot}
            className="bg-[#000] py-2 px-5 rounded text-white h-fit cursor-pointer mb-4"
          >
            Add Time Slot
          </button>

          {/* Display Added Time Slots */}
          {formData.timeSlots?.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <h3 className="font-medium mb-3">Current Time Slots:</h3>
              <div className="space-y-3">
                {formData.timeSlots
                  ?.slice() // make a shallow copy to avoid mutating state
                  .sort((a, b) => {
                    const dayOrder = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                    return dayOrder.indexOf(a.day.toLowerCase()) - dayOrder.indexOf(b.day.toLowerCase());
                  })
                  .map((item, index) => (
                    <div key={index} className="bg-gray-100 p-3 rounded flex justify-between items-center">
                      <div>
                        <span className="font-medium">
                          {item.day.charAt(0).toUpperCase() + item.day.slice(1)}
                        </span>: {item.startingTime} - {item.endingTime}
                      </div>
                      <button
                        onClick={(e) => deleteTimeSlot(e, index)}
                        className="bg-red-600 p-1 rounded-full text-white text-[16px] cursor-pointer"
                      >
                        <AiOutlineDelete />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

        </div>

        <div className="mb-5">
          <p className="form__label">About*</p>
          <textarea
            name="about"
            rows={5}
            value={formData.about}
            placeholder="Write about you"
            className="form__input"
            onChange={handleInputChange}
          ></textarea>
        </div>

        <div className="mb-5 flex items-center gap-3">
          {formData.photo && (
            <figure className="w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center">
              <img
                src={formData.photo}
                alt=""
                className="w-full rounded-full"
              />
            </figure>
          )}

          <div className="relative w-[130px] h-[50px]">
            <input
              type="file"
              name="photo"
              id="customfile"
              onChange={handleFileInputChange}
              accept="image/*"
              className=" absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            />

            <label
              htmlFor="customfile"
              className=" absolute top-0 left-0 w-full h-full flex items-center px-[0.75rem] py-[0.375rem] text-[15px] leading-6 overflow-hidden bg-[#0066ff46] text-headingColor font-semibold rounded-lg truncate cursor-pointer "
            >
              Upload Photo
            </label>
          </div>
        </div>

        <div className="mt-7">
          <button
            type="submit"
            onClick={updateProfileHandler}
            className="bg-primaryColor text-white text-[18px] leading-[30px] w-full py-3 px-4 rounded-lg"
          >
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
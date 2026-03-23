import UserLayout from "@/layout/UserLayout";
import React,{useEffect,useState} from "react";
import DashboardLayout from "@/layout/DashboardLayout";
import { getAboutUser } from "@/config/redux/action/authAction";
import styles from "./index.module.css"
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL, clientServer } from "@/config";
import { getAllPosts } from "@/config/redux/action/postAction";


export default function ProfilePage() {

    const authState = useSelector((state) => state.auth)
    const postReducer =useSelector((state)=>state.postReducer)
    const [userProfile, setUserProfile] = useState({})
    const [userPosts,setUserPosts]=useState([])
    const [isEdited, setIsEdited] = useState(false);
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [inputData, setInputData] = useState({ company: '', position: '', years: '' });
    const handleWorkInputChange = (e) => {
        const { name, value } = e.target;
        setInputData({ ...inputData, [name]:value})
    }
    const [editIndex, setEditIndex] = useState(null);

    useEffect(() => {
        dispatch(getAboutUser(localStorage.getItem('token')))
        dispatch(getAllPosts())
    }, [])
    
    useEffect(() => {
        
        if (authState.user) {
            setUserProfile(authState.user)
            let post = postReducer.posts.filter((post) => {
                return post.userId.username===authState.user.userId.username
            })
            
            setUserPosts(post);
            setIsEdited(false);
        }
        
    }, [authState.user,postReducer.posts])

    const updateProfilePicture = async (file) => {
        const formData = new FormData();
        formData.append("profile_picture", file);
        formData.append("token", localStorage.getItem('token'));

        await clientServer.post("/update_profile_picture", formData, {
            headers: {
                'Content-Type': "multipart/form-data",
            }
        });
        dispatch(getAboutUser(localStorage.getItem('token')))
    }

    const updateProfileData = async () => {

        await clientServer.post("/user_update", {
            token: localStorage.getItem('token'),
            name: userProfile.userId.name
        });

        await clientServer.post("/update_profile_data", {
            token: localStorage.getItem('token'),
            bio: userProfile.bio,
            currentPost: userProfile.currentPost,
            postWork: userProfile.postWork,
            education: userProfile.education
        });

        dispatch(getAboutUser(localStorage.getItem('token')));
        setIsEdited(false);
    }
    

    
    return (
        <UserLayout>
            <DashboardLayout>
                {authState.user && userProfile.userId &&
                    <div className={styles.container}>

                        {/* Cover */}
                        <div className={styles.backDropContainer}>
                            
                            <label htmlFor="profilePictureUpload" className={styles.backDrop_overlay}>
                                <p>
                                    Edit
                                </p>
                            </label>
                            <input onChange={(e) => {
                                updateProfilePicture(e.target.files[0])
                            }} hidden type="file" id="profilePictureUpload"/>
                            <img
                                src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
                                alt="backdrop"
                                />
                            </div>
                    

                        {/* Profile Info */}
                        <div className={styles.profileContainer_details}>

                            <div style={{ display: "flex", gap: "0.7rem", justifyContent: "space-between" }}>

                                {/* LEFT SIDE */}
                                <div style={{ flex: "0.8" }}>

                                    <div style={{ display: "flex", width:"fit-content", alignItems: "center", gap: "1.2rem" }}>
                                        <input className={styles.nameEdit} type="text" value={userProfile.userId.name} onChange={(e) => {
                                            setUserProfile({...userProfile,userId:{...userProfile.userId,name:e.target.value}})
                                            setIsEdited(true); 
                                        }} />
                                        <p contentEditable style={{ color: "grey" }}>
                                            @{userProfile.userId.username}
                                        </p>
                                    </div>
                                    

                                    {/* BIO */}
                                    <div> 
                                        <textarea
                                            value={userProfile.bio || ""}
                                            onChange={(e) => {
                                                setUserProfile({ ...userProfile, bio: e.target.value });
                                                setIsEdited(true);
                                            }}
                                            rows={Math.max(3, Math.ceil((userProfile.bio || "").length / 80))}
                                            style={{ width: "100%" }}
                                        />
                                        </div>
                                    </div>

                                {/* RIGHT SIDE */}
                                <div style={{ flex: "0.2" }}>
                                    <h3>Recent Activity</h3>

                                    {userPosts.map((post) => {
                                        return (
                                            <div key={post._id} className={styles.postCard}>

                                                <div className={styles.card}>
                                                    <div className={styles.card_profileContainer}></div>

                                                    {post.media && (
                                                        <img
                                                            src={`${BASE_URL}/${post.media}`}
                                                            alt="post"
                                                            style={{
                                                                width: "3.4rem",
                                                                height: "3.4rem",
                                                                objectFit: "cover"
                                                            }}
                                                        />
                                                    )}
                                                </div>

                                                <p>{post.body}</p>

                                            </div>
                                        );
                                    })}
                                </div>

                            </div>

                        </div>

                        {/* WORK HISTORY */}
                        <div className="workHistory">
                            <h4>Work History</h4>

                            <div className={styles.workHistoryContainer}>
                                {userProfile.postWork?.map((work, index) => {
                                    return (
                                        <div key={index} className={styles.workHistoryCard}>
                                            <p style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                                {work.company} - {work.position}
                                            </p>
                                            <p>{work.years}</p>
                                        </div>
                                    );
                                })}
                                <button className={styles.addWorkButton} onClick={() => {
                                    setIsModalOpen(true)
                                }}>Add Work
                                </button>
                            </div>
                        </div>

                        {isEdited && (
                            <div onClick={() => {
                                updateProfileData();
                            }} className={styles.updateProfileBtn}>
                                Update Profile
                        </div>)}

                    </div>
                }

                {
                    isModalOpen && 
                    <div
                        onClick={() => {
                                setIsModalOpen(false);
                    }} className={styles.commentsContainer}>
                            <div onClick={(e) => {
                                e.stopPropagation()
                            }} className={styles.allCommentsContainer}>

                                <input
                                    onChange={handleWorkInputChange}
                                    className={styles.inputField}
                                    type="text"
                                    placeholder="Enter Company"
                                    name="company"
                                    value={inputData.company || ""}
                                />

                                <input
                                    onChange={handleWorkInputChange}
                                    className={styles.inputField}
                                    type="text"
                                    placeholder="Enter Position"
                                    name="position"
                                    value={inputData.position || ""}
                                />

                                <input
                                    onChange={handleWorkInputChange}
                                    className={styles.inputField}
                                    type="number"
                                    placeholder="Years"
                                    name="years"
                                    value={inputData.years || ""}
                                />
                                
                                <div onClick={() => {
                                    setUserProfile({
                                        ...userProfile,
                                        postWork: [...(userProfile.postWork || []), inputData]
                                    });

                                    setIsEdited(true);
                                    setInputData({ company: '', position: '', years: '' });
                                    setIsModalOpen(false);

                                }} className={styles.updateProfileBtn}>
                                    Add Work
                                </div>

                            </div>
                        </div>
                }
                
            </DashboardLayout>
        </UserLayout>
    )
}
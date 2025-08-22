import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
    collection, 
    getDocs, 
    getDoc, 
    doc, 
    updateDoc, 
    query, 
    limit, 
    startAfter, 
    orderBy 
} from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { logo } from "../../../assets";
import { useNavigate } from "react-router-dom";
import "./AdminAllAuctions.css";

const AdminAllAuctions = () => {
    const [auctions, setAuctions] = useState([]);
    const [sellers, setSellers] = useState({}); 
    const [filter, setFilter] = useState("all");
    const [loadingAuctionId, setLoadingAuctionId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [lastDoc, setLastDoc] = useState(null);
    const navigate = useNavigate();
    const [initialLoad, setInitialLoad] = useState(true);

    const BATCH_SIZE = 20; 

    const fetchSellersData = async (sellerIds) => {
        const uniqueSellerIds = [...new Set(sellerIds)];
        const newSellers = {};
        
        const sellersToFetch = uniqueSellerIds.filter(id => !sellers[id] && id);
        
        if (sellersToFetch.length === 0) return sellers;

        const sellerPromises = sellersToFetch.map(async (sellerId) => {
            try {
                const sellerRef = doc(db, "users", sellerId);
                const sellerSnap = await getDoc(sellerRef);
                if (sellerSnap.exists()) {
                    const sellerData = sellerSnap.data();
                    return {
                        id: sellerId,
                        name: sellerData.name || "Unknown",
                        email: sellerData.email || "No email"
                    };
                }
            } catch (error) {
                console.error(`Error fetching seller ${sellerId}:`, error);
            }
            return {
                id: sellerId,
                name: "Unknown",
                email: "No email"
            };
        });

        const sellerResults = await Promise.all(sellerPromises);
        
        sellerResults.forEach(seller => {
            if (seller) {
                newSellers[seller.id] = seller;
            }
        });

        const updatedSellers = { ...sellers, ...newSellers };
        setSellers(updatedSellers);
        return updatedSellers;
    };

    const fetchAuctions = async (isLoadMore = false) => {
        if (loading) return;
        
        setLoading(true);

        try {
            let auctionsQuery = query(
                collection(db, "auctions"),
                orderBy("createdAt", "desc"), 
                limit(BATCH_SIZE)
            );

            if (isLoadMore && lastDoc) {
                auctionsQuery = query(
                    collection(db, "auctions"),
                    orderBy("createdAt", "desc"),
                    startAfter(lastDoc),
                    limit(BATCH_SIZE)
                );
            }

            const snapshot = await getDocs(auctionsQuery);
            
            if (snapshot.empty) {
                setHasMore(false);
                setLoading(false);
                return;
            }

            const newAuctions = [];
            const sellerIds = [];

            snapshot.docs.forEach((docSnap) => {
                const auction = docSnap.data();
                newAuctions.push({
                    id: docSnap.id,
                    title: auction.title || "Untitled",
                    media: auction.media || [],
                    isBanned: auction.isBanned ?? false,
                    sellerId: auction.sellerId || "",
                    createdAt: auction.createdAt
                });
                
                if (auction.sellerId) {
                    sellerIds.push(auction.sellerId);
                }
            });

            await fetchSellersData(sellerIds);

            if (isLoadMore) {
                setAuctions(prev => [...prev, ...newAuctions]);
            } else {
                setAuctions(newAuctions);
            }

            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            setHasMore(snapshot.docs.length === BATCH_SIZE);

        } catch (error) {
            console.error("Error fetching auctions:", error);
        } finally {
            setLoading(false);
            if (initialLoad) setInitialLoad(false);
        }
    };

    const handleBanToggle = async (auctionId, isBanned) => {
        setLoadingAuctionId(auctionId);
        
        try {
            await updateDoc(doc(db, "auctions", auctionId), {
                isBanned: !isBanned
            });

            setAuctions(prev => 
                prev.map(auction => 
                    auction.id === auctionId 
                        ? { ...auction, isBanned: !isBanned }
                        : auction
                )
            );

        } catch (error) {
            console.error("Error updating auction:", error);
        } finally {
            setTimeout(() => {
                setLoadingAuctionId(null);
            }, 800);
        }
    };

    // Reset and reload when filter changes
    const handleFilterChange = useCallback((newFilter) => {
        setFilter(newFilter);
        setAuctions([]);
        setLastDoc(null);
        setHasMore(true);
        // Note: You might want to implement server-side filtering for better performance
        // For now, we'll filter on the client side
    }, []);

    // Memoized filtered auctions
    const filteredAuctions = useMemo(() => {
        switch (filter) {
            case "active":
                return auctions.filter(a => !a.isBanned);
            case "banned":
                return auctions.filter(a => a.isBanned);
            default:
                return auctions;
        }
    }, [auctions, filter]);

    // Infinite scroll handler
    const handleScroll = useCallback(() => {
        if (
            window.innerHeight + document.documentElement.scrollTop
            >= document.documentElement.offsetHeight - 1000 && // Load more when 1000px from bottom
            !loading &&
            hasMore &&
            filter === "all" // Only auto-load for "all" filter
        ) {
            fetchAuctions(true);
        }
    }, [loading, hasMore, filter]);

    // Load more button for filtered views
    const handleLoadMore = () => {
        if (filter === "all") {
            fetchAuctions(true);
        }
    };

    useEffect(() => {
        fetchAuctions(false);
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Show loading skeleton for initial load
    const LoadingSkeleton = () => (
        <>
            {[...Array(5)].map((_, index) => (
                <tr key={`skeleton-${index}`} className="skeleton-row">
                    <td><div className="skeleton-thumbnail"></div></td>
                    <td><div className="skeleton-text"></div></td>
                    <td><div className="skeleton-text"></div></td>
                    <td><div className="skeleton-text"></div></td>
                    <td><div className="skeleton-text small"></div></td>
                    <td><div className="skeleton-button"></div></td>
                </tr>
            ))}
        </>
    );

    return (
        <>
            <header className="header-bar-admin-us">
                <div className="logo-section">
                    <button
                        onClick={() => navigate("/admin-dashboard")}
                        className="unstyled-logo-button"
                    >
                        <img src={logo} alt="Logo" />
                    </button>
                </div>
                <div>
                    <h1>Admin Dashboard</h1>
                </div>
            </header>

            <div className="admin-auctions-container">
                <div className="header-section">
                    <h2>All Auctions ({auctions.length} loaded)</h2>
                    
                </div>

                <div className="table-container">
                    <table className="auctions-table">
                        <thead>
                            <tr>
                                <th>Thumbnail</th>
                                <th>Title</th>
                                <th>Seller Name</th>
                                <th>Seller Email</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAuctions.map((auction) => {
                                const seller = sellers[auction.sellerId] || {};
                                return (
                                    <tr key={auction.id}>
                                        <td>
                                            <img
                                                src={auction.media[0] || "https://via.placeholder.com/80"}
                                                alt="auction"
                                                className="thumbnail"
                                                loading="lazy" 
                                                onError={(e) => {
                                                    e.target.src = "https://via.placeholder.com/80";
                                                }}
                                            />
                                        </td>
                                        <td>{auction.title}</td>
                                        <td>{seller.name || "Loading..."}</td>
                                        <td>{seller.email || "Loading..."}</td>
                                        <td>
                                            <span className={`status-badge ${auction.isBanned ? "banned" : "active"}`}>
                                                {auction.isBanned ? "Banned" : "Active"}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleBanToggle(auction.id, auction.isBanned)}
                                                className={`action-btn ${auction.isBanned ? "unban-btn" : "ban-btn"}`}
                                                disabled={loadingAuctionId === auction.id}
                                            >
                                                {loadingAuctionId === auction.id ? (
                                                    <>
                                                        <span className="loader"></span>
                                                        {auction.isBanned ? "Unbanning..." : "Banning..."}
                                                    </>
                                                ) : (
                                                    auction.isBanned ? "Unban" : "Ban"
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            
                            {initialLoad && <LoadingSkeleton />}
                            
                            {filteredAuctions.length === 0 && !initialLoad && (
                                <tr>
                                    <td colSpan="6" className="no-data">
                                        No auctions found for the selected filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Load more button for filtered views or manual loading */}
                {hasMore && !loading && filter !== "all" && (
                    <div className="load-more-section">
                        <button 
                            onClick={handleLoadMore}
                            className="load-more-btn"
                        >
                            Load More Auctions
                        </button>
                    </div>
                )}

                {loading && !initialLoad && (
                    <div className="loading-indicator">
                        <span className="loader"></span>
                        Loading more auctions...
                    </div>
                )}

                {!hasMore && auctions.length > 0 && (
                    <div className="end-message">
                        You've reached the end of all auctions.
                    </div>
                )}
            </div>
        </>
    );
};

export default AdminAllAuctions;
import axios from "axios";

export async function reverseGeocode(lat, lng) {
    try {
        const res = await axios.get(
            "https://nominatim.openstreetmap.org/reverse",
            {
                params: {
                    format: "json",
                    lat,
                    lon: lng,
                    zoom: 18,
                    addressdetails: 1
                },
                headers: {
                    "User-Agent": "BlogSnap/1.0 (contact@blogsnap.app)"
                }
            }
        );
        const addr = res.data.address || {};
        const display = res.data.display_name || "";

        let areaGuess =
            addr.suburb ||
            addr.neighbourhood ||
            addr.residential ||
            addr.quarter ||
            addr.hamlet ||
            addr.village ||
            addr.road ||
            addr.city_district ||
            addr.state_district ||
            "";

        if (!areaGuess && display) {
            // take 2nd part from "Palasia, Indore, MP, India"
            areaGuess = display.split(",")[0];
        }

        return {
            city:
                addr.city ||
                addr.town ||
                addr.village ||
                addr.county ||
                "",
            area: areaGuess
        };


    } catch (err) {
        console.log("Reverse geocode failed:", err.message);
        return { city: "", area: "" };
    }
}

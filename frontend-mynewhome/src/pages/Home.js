// src/pages/Home.js
import React, { useEffect, useState } from "react";
import { getAllProperties } from "../api/propertyApi";
import PropertyCard from "../components/PropertyCard";
import 'bootstrap/dist/css/bootstrap.min.css';


export default function Home({ selectedCategory = "All" }) {
  const [properties, setProperties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getAllProperties()
      .then((data) => {
        if (!Array.isArray(data)) {
          console.warn("API did not return an array:", data);
          data = [];
        }
        if (mounted) {
          setProperties(data);
          setFiltered(data);
        }
      })
      .catch((err) => {
        console.error("Error fetching properties:", err);
        if (mounted) {
          setProperties([]);
          setFiltered([]);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!Array.isArray(properties)) {
      setFiltered([]);
      return;
    }

    // Optional filtering by category/type if your entity has 'type'
    if (selectedCategory && selectedCategory !== "All") {
      setFiltered(properties.filter((p) => p?.type === selectedCategory));
    } else {
      setFiltered(properties);
    }
  }, [selectedCategory, properties]);

  const list = Array.isArray(filtered) ? filtered : [];

  if (loading) {
    return (
      <div className="container mt-4">
        <p>Loading properties...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        {list.length > 0 ? (
          list.map((p, index) => (
            <div className="col-md-3 mb-4" key={p?.id ?? index}>
              <PropertyCard property={p} />
            </div>
          ))
        ) : (
          <p>No properties found.</p>
        )}
      </div>
    </div>
  );
}






// // src/pages/Home.js  (paste/overwrite this file)
// import React, { useEffect, useState } from "react";
// import { getAllProperties } from "../api/propertyApi";
// import PropertyCard from "../components/PropertyCard";

// export default function Home({ selectedCategory = "All" }) {
//   const [properties, setProperties] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let mounted = true;
//     getAllProperties()
//       .then((data) => {
//         // getAllProperties() in your api already returns response.data (array),
//         // but we defensive-check here.
//         if (!Array.isArray(data)) {
//           console.warn("API did not return an array:", data);
//           data = [];
//         }
//         if (mounted) {
//           setProperties(data);
//           setFiltered(data);
//         }
//       })
//       .catch((err) => {
//         console.error("Error fetching properties:", err);
//         if (mounted) {
//           setProperties([]);
//           setFiltered([]);
//         }
//       })
//       .finally(() => {
//         if (mounted) setLoading(false);
//       });

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   useEffect(() => {
//     if (!Array.isArray(properties)) {
//       setFiltered([]);
//       return;
//     }
//     if (selectedCategory && selectedCategory !== "All") {
//       setFiltered(properties.filter((p) => p?.type === selectedCategory));
//     } else {
//       setFiltered(properties);
//     }
//   }, [selectedCategory, properties]);

//   // extra safety: always use an array for rendering
//   const list = Array.isArray(filtered) ? filtered : [];

//   if (loading) {
//     return (
//       <div className="container mt-4">
//         <p>Loading properties...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mt-4">
//       <div className="row">
//         {list.length > 0 ? (
//           list.map((p, index) => (
//             <div className="col-md-3 mb-4" key={p?.id ?? index}>
//               <PropertyCard property={p} />
//             </div>
//           ))
//         ) : (
//           <p>No properties found.</p>
//         )}
//       </div>
//     </div>
//   );
// }

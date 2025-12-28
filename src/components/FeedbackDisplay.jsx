import { useState, useEffect } from 'react';


export default function FeedbackDisplay() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('newest');
  const [filterType, setFilterType] = useState('all');
  const [retrivedData, setRetrievedData] = useState([]);
  const[avgrate,setAvgrate]=useState(0);
  useEffect(() => {
    fetchFeedbacks();
  }, [sortOrder, filterType]);


  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
        var response=await fetch('http://localhost:5000/feedback/veiwfeedback');
        const data = await response.json();
        console.log(data);
        if (response.status !== 200) {
          console.log('Failed to fetch feedbacks');
        }
        setRetrievedData(data.feedback);
        setAvgrate(data.avg);
      // Apply filtering
      let filtered = data.feedback;
      if (filterType !== 'all') {
        filtered = filtered.filter(f => f.type === filterType);
      }


      // Apply sorting
      if (sortOrder === 'newest') {
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } else {
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      }


      setFeedbacks(filtered);
      setLoading(false);


    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setLoading(false);
    }
  };


  const StarRating = ({ rating, max = 5 }) => {
  return (
    <div className="text-yellow-500 text-xl">
      {[...Array(max)].map((_, i) => (
        <span key={i}>
          {i < Math.round(rating) ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
};


  const getTypeColor = (type) => {
  if (type === 'Complaint') {
    return 'bg-red-100 text-red-700 border-red-300';
  }
  if (type === 'Neutral') {
    return 'bg-gray-100 text-gray-700 border-gray-300';
  }
  return 'bg-green-100 text-green-700 border-green-300';
};


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EDE8F5] via-[#ADBBDA] to-[#7091E6] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#3D52A0] mx-auto mb-4"></div>
          <p className="text-[#3D52A0] font-semibold">Loading feedbacks...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDE8F5] via-[#ADBBDA] to-[#7091E6] p-6">
      <div className="max-w-6xl mx-auto">
       
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#3D52A0] mb-2">
            Feedback & Complaints
          </h1>
          <p className="text-gray-600">
            View customer feedback and complaints
          </p>
        </div>


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 rounded-lg shadow-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total</p>
            <p className="text-3xl font-bold text-[#3D52A0]">{retrivedData.length}</p>
          </div>


          <div className="bg-white/80 rounded-lg shadow-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Feedbacks</p>
            <p className="text-3xl font-bold text-green-600">
              {retrivedData.filter(f => f.type === 'Feedback').length}
            </p>
          </div>


          <div className="bg-white/80 rounded-lg shadow-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Complaints</p>
            <p className="text-3xl font-bold text-red-600">
              {retrivedData.filter(f => f.type === 'Complaint').length}
            </p>
          </div>


         <div className="bg-white/80 rounded-lg shadow-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Neutral</p>
            <p className="text-3xl font-bold text-gray-600">
              {retrivedData.filter(f => f.type === 'Neutral').length}
            </p>
          </div>


          <div className="bg-white/80 rounded-lg shadow-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Avg Rating</p>


          <div className="flex items-center gap-2">
          <p className="text-3xl font-bold text-[#3D52A0]">
          {avgrate.toFixed(1)}
          </p>
          <StarRating rating={avgrate} />
          </div>
          </div>




        </div>


        {/* Filter Options */}
        <div className="bg-white/80 rounded-lg shadow-lg p-6 border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
           
            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-[#3D52A0]">Filter:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filterType === 'all'
                      ? 'bg-[#7091E6] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('Feedback')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filterType === 'Feedback'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Feedbacks
                </button>
                <button
                  onClick={() => setFilterType('Complaint')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filterType === 'Complaint'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Complaints
                </button>
                <button
                  onClick={() => setFilterType('Neutral')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filterType === 'Neutral'
                      ? 'bg-gray-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Neutral
                </button>
              </div>
            </div>


            {/* Sort Order */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-[#3D52A0]">Sort:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7091E6] bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>


        {/* Feedback List */}
        <div className="space-y-4">
          {feedbacks.length === 0 ? (
            <div className="bg-white/80 rounded-lg shadow-lg p-12 border border-gray-200 text-center">
              <span className="text-6xl mb-4 block">📭</span>
              <p className="text-xl text-gray-600">No feedbacks found</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="bg-white/80 rounded-lg shadow-lg p-6 border-l-4 border-[#7091E6] hover:shadow-xl transition"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getTypeColor(feedback.type)}`}>
                      {feedback.type.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">Shipment ID: {feedback.shipment_id}</span>
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(feedback.created_at)}</p>
                </div>


                {/* Message */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{feedback.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

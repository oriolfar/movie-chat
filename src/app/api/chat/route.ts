import { NextRequest, NextResponse } from "next/server";

interface Movie {
  id: string;
  title: string;
  year: number;
  poster: string | null;
  description: string;
  rating: number;
  score?: number;
  backdrop_path?: string | null;
  vote_count?: number;
  tmdb_available?: boolean;
}

interface N8NMovie {
  id?: string | number;
  tmdb_id?: string | number;
  title?: string;
  name?: string;
  year?: number;
  release_year?: number;
  release_date?: string;
  poster?: string | null;
  poster_path?: string | null;
  overview?: string;
  description?: string;
  rating?: number;
  vote_average?: number;
  score?: number;
  backdrop_path?: string | null;
  vote_count?: number;
  tmdb_available?: boolean;
  missing_fields?: string[];
  missing_info_note?: string;
}

interface N8NResponse {
  message?: string;
  titlesString?: string;
  allTitles?: string[];
  movies?: N8NMovie[];
  success?: boolean;
}

/**
 * Normalize movie title for comparison (remove extra spaces, lowercase, trim)
 */
function normalizeTitle(title: string): string {
  return title.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Check if two movies are duplicates based on title and optionally year
 */
function areMoviesDuplicate(movie1: Movie, movie2: Movie): boolean {
  const title1 = normalizeTitle(movie1.title);
  const title2 = normalizeTitle(movie2.title);
  
  // Exact title match
  if (title1 === title2) {
    return true;
  }
  
  // If both have years, check if title matches and years are close (within 1 year)
  // This handles cases like "The Matrix (1999)" vs "The Matrix (2000)"
  if (movie1.year && movie2.year && Math.abs(movie1.year - movie2.year) <= 1) {
    // Remove year from title if present (e.g., "The Matrix (1999)" -> "the matrix")
    const cleanTitle1 = title1.replace(/\s*\(\d{4}\)\s*$/, '');
    const cleanTitle2 = title2.replace(/\s*\(\d{4}\)\s*$/, '');
    if (cleanTitle1 === cleanTitle2) {
      return true;
    }
  }
  
  return false;
}

/**
 * Remove duplicate movies and limit to 5 unique movies
 * Returns deduplicated array and analysis info
 */
function deduplicateMovies(movies: Movie[]): { uniqueMovies: Movie[]; duplicatesFound: number; originalCount: number } {
  const originalCount = movies.length;
  const uniqueMovies: Movie[] = [];
  let duplicatesFound = 0;

  for (const movie of movies) {
    // Stop if we've reached the limit of 5 unique movies
    if (uniqueMovies.length >= 5) {
      console.log(`⚠️ Movie limit reached (5), skipping remaining ${originalCount - uniqueMovies.length - duplicatesFound} movies`);
      break;
    }
    
    // Check if this movie is a duplicate of any already in uniqueMovies
    let isDuplicate = false;
    for (const seenMovie of uniqueMovies) {
      if (areMoviesDuplicate(movie, seenMovie)) {
        isDuplicate = true;
        duplicatesFound++;
        console.log(`🔄 Duplicate detected: "${movie.title}" (${movie.year || 'N/A'}) - already have "${seenMovie.title}" (${seenMovie.year || 'N/A'})`);
        break;
      }
    }
    
    // If not a duplicate, add it to unique movies
    if (!isDuplicate) {
      uniqueMovies.push(movie);
    }
  }

  // Log summary if duplicates were found or if movies were limited
  if (duplicatesFound > 0 || originalCount > uniqueMovies.length) {
    const removedCount = originalCount - uniqueMovies.length;
    console.log(`📊 Deduplication analysis: ${originalCount} movies → ${uniqueMovies.length} unique movies`);
    if (duplicatesFound > 0) {
      console.log(`   └─ Removed ${duplicatesFound} duplicate${duplicatesFound > 1 ? 's' : ''}`);
    }
    if (removedCount > duplicatesFound) {
      console.log(`   └─ Limited to 5 movies (${removedCount - duplicatesFound} additional movies skipped)`);
    }
  }

  return {
    uniqueMovies,
    duplicatesFound,
    originalCount
  };
}

/**
 * Transform n8n response to frontend Movie format
 */
function transformN8NResponseToMovies(n8nData: N8NResponse): Movie[] {
  const movies: Movie[] = [];

  // PRIORITY 1: Check for movies array first (this has all the complete data)
  // n8n format: { id, title, year, poster (full URL), description, rating, score, backdrop_path (full URL), vote_count, tmdb_available }
  if (n8nData.movies && Array.isArray(n8nData.movies) && n8nData.movies.length > 0) {
    console.log("🔍 Processing movies array (priority format), length:", n8nData.movies.length);
    n8nData.movies.forEach((movie: N8NMovie, index: number) => {
      // n8n provides all fields in the exact format we need
      // Use them DIRECTLY - trust the data from n8n
      
      // Debug: Log raw movie data
      if (index === 0) {
        console.log("🔍 Raw movie[0] in transform:", {
          year: movie.year,
          yearType: typeof movie.year,
          rating: movie.rating,
          ratingType: typeof movie.rating,
          score: movie.score,
          scoreType: typeof movie.score,
          poster: movie.poster?.substring(0, 50),
          posterType: typeof movie.poster
        });
      }
      
      // Year: n8n provides as number (e.g., 1990) - use directly, trust the data
      const year = (typeof movie.year === 'number' && movie.year > 1900)
        ? movie.year
        : (typeof movie.release_year === 'number' && movie.release_year > 1900)
          ? movie.release_year
          : new Date().getFullYear();

      // Rating: n8n provides as number (e.g., 4.498, 5.5) - use directly, trust the data
      const rating = (typeof movie.rating === 'number')
        ? movie.rating
        : (typeof movie.vote_average === 'number')
          ? movie.vote_average
          : 8.0;

      // Score: n8n provides as number (e.g., 23, 15) - can be 0, use directly, trust the data
      const score = (typeof movie.score === 'number')
        ? movie.score
        : undefined;

      // Poster: n8n provides full URL (e.g., "https://image.tmdb.org/t/p/w500/...")
      const poster = (movie.poster && typeof movie.poster === 'string' && movie.poster.length > 0)
        ? movie.poster
        : (movie.poster_path && typeof movie.poster_path === 'string' && movie.poster_path.length > 0
          ? (movie.poster_path.startsWith('http') 
            ? movie.poster_path 
            : `https://image.tmdb.org/t/p/w500${movie.poster_path}`)
          : null);

      // Backdrop: n8n provides full URL
      const backdrop_path = (movie.backdrop_path && typeof movie.backdrop_path === 'string' && movie.backdrop_path.length > 0)
        ? (movie.backdrop_path.startsWith('http') 
          ? movie.backdrop_path 
          : `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`)
        : null;

      // Description: n8n provides as description field
      const description = (movie.description && typeof movie.description === 'string' && movie.description.length > 0)
        ? movie.description
        : (movie.overview && typeof movie.overview === 'string' && movie.overview.length > 0
          ? movie.overview
          : `A recommended film: ${movie.title || 'Unknown'}`);

      // Vote count: n8n provides as number
      const vote_count = (movie.vote_count !== undefined && movie.vote_count !== null && typeof movie.vote_count === 'number')
        ? movie.vote_count
        : undefined;

      // Debug: Log transformed values
      if (index === 0) {
        console.log("🔍 Transformed movie[0] values:", {
          year,
          rating,
          score,
          poster: poster?.substring(0, 50) || 'null',
          description: description?.substring(0, 50) || 'null'
        });
      }

      movies.push({
        id: movie.id?.toString() || movie.tmdb_id?.toString() || `movie-${index}-${Date.now()}`,
        title: movie.title || movie.name || 'Unknown',
        year: year,
        poster: poster,
        description: description,
        rating: rating,
        score: score,
        backdrop_path: backdrop_path,
        vote_count: vote_count,
        tmdb_available: movie.tmdb_available !== false,
      });
    });
    return movies; // Return early - we have complete data
  }
  
  // FALLBACK 1: If n8n returns an array of titles (legacy format)
  else if (n8nData.allTitles && Array.isArray(n8nData.allTitles) && n8nData.allTitles.length > 0) {
    console.log("⚠️ Using fallback: allTitles array, length:", n8nData.allTitles.length);
    n8nData.allTitles.forEach((title, index) => {
      movies.push({
        id: `movie-${index}-${Date.now()}`,
        title: title.trim(),
        year: new Date().getFullYear(), // Default year, no data available
        poster: null,
        description: `A recommended film: ${title}`,
        rating: 8.0, // Default rating, no data available
      });
    });
    return movies; // Return early for titles format
  }
  
  // FALLBACK 2: If n8n returns titlesString (legacy format)
  else if (n8nData.titlesString && typeof n8nData.titlesString === 'string' && n8nData.titlesString.trim().length > 0) {
    console.log("⚠️ Using fallback: titlesString");
    const titles = n8nData.titlesString.split(',').map(t => t.trim()).filter(Boolean);
    titles.forEach((title, index) => {
      movies.push({
        id: `movie-${index}-${Date.now()}`,
        title: title,
        year: new Date().getFullYear(),
        poster: null,
        description: `A recommended film: ${title}`,
        rating: 8.0,
      });
    });
    return movies; // Return early for titlesString format
  }

  // If no data found, return empty array
  console.log("⚠️ No movie data found in n8n response");
  return movies;
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // N8N webhook URL - supports Railway service references and direct URLs
    // Railway format: ${{n8n.RAILWAY_PUBLIC_DOMAIN}}/webhook/movie-chat
    // Or use internal networking: http://n8n:5678/webhook/movie-chat
    const n8nWebhookUrl = 
      process.env.N8N_WEBHOOK_URL || 
      process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ||
      (process.env.RAILWAY_ENVIRONMENT ? `http://n8n:5678/webhook/movie-chat` : undefined);

    if (!n8nWebhookUrl) {
      console.error("N8N webhook URL not configured. Set N8N_WEBHOOK_URL or NEXT_PUBLIC_N8N_WEBHOOK_URL");
      return NextResponse.json(
        { 
          error: "N8N webhook URL not configured",
          response: "I'm currently being set up. Please configure the N8N webhook URL."
        },
        { status: 500 }
      );
    }

    // Send message to N8N
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error(`N8N request failed: ${n8nResponse.status}`, errorText);
      console.error(`N8N Webhook URL used: ${n8nWebhookUrl}`);
      return NextResponse.json(
        { 
          error: `N8N request failed: ${n8nResponse.status}`,
          response: "I'm having trouble connecting to my movie database right now. Please try again in a moment.",
          movies: [],
          details: errorText.substring(0, 200) // First 200 chars of error
        },
        { status: 500 }
      );
    }

    let n8nData: N8NResponse;
    try {
      n8nData = await n8nResponse.json();
      // Debug: Log the raw n8n response
      console.log("✅ Raw n8n response received");
      console.log("Movies array length:", n8nData.movies?.length || 0);
      if (n8nData.movies && n8nData.movies.length > 0) {
        console.log("First movie from n8n:", {
          id: n8nData.movies[0].id,
          title: n8nData.movies[0].title,
          year: n8nData.movies[0].year,
          rating: n8nData.movies[0].rating,
          score: n8nData.movies[0].score,
          poster: n8nData.movies[0].poster?.substring(0, 50) || 'no poster'
        });
      }
    } catch (jsonError) {
      console.error("Failed to parse N8N response as JSON:", jsonError);
      // Clone the response before reading it to avoid "Body is unusable" error
      const responseClone = n8nResponse.clone();
      try {
        const responseText = await responseClone.text();
        console.error("N8N response text:", responseText.substring(0, 500));
      } catch (textError) {
        console.error("Could not read response text:", textError);
      }
      return NextResponse.json(
        { 
          error: "Invalid JSON response from N8N",
          response: "I received an unexpected response. Please try again.",
          movies: []
        },
        { status: 500 }
      );
    }

    // Transform n8n response to frontend format
    const transformedMovies = transformN8NResponseToMovies(n8nData);
    
    // Debug: Log transformed movies
    console.log("✅ Transformed movies count:", transformedMovies.length);
    if (transformedMovies.length > 0) {
      console.log("First transformed movie:", {
        id: transformedMovies[0].id,
        title: transformedMovies[0].title,
        year: transformedMovies[0].year,
        rating: transformedMovies[0].rating,
        score: transformedMovies[0].score,
        poster: transformedMovies[0].poster?.substring(0, 50) || 'no poster'
      });
    }

    // Deduplicate movies and limit to 5 unique movies
    const { uniqueMovies, duplicatesFound, originalCount } = deduplicateMovies(transformedMovies);
    
    // Log deduplication results
    if (duplicatesFound > 0) {
      console.log(`🔍 Deduplication complete: ${originalCount} → ${uniqueMovies.length} unique movies (removed ${duplicatesFound} duplicate${duplicatesFound > 1 ? 's' : ''})`);
    } else if (originalCount > 5) {
      console.log(`⚠️ Limited to 5 movies (had ${originalCount} total)`);
    }

    // Get response message - use unique movies count
    const responseMessage = 
      n8nData.message || 
      n8nData.titlesString || 
      (uniqueMovies.length > 0 
        ? `I found ${uniqueMovies.length} movie${uniqueMovies.length > 1 ? 's' : ''} for you!` 
        : "I received your message!");

    // Return the response from N8N with deduplicated movies
    return NextResponse.json({
      response: responseMessage,
      movies: uniqueMovies,
    });

  } catch (error) {
    console.error("Error communicating with N8N:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      { 
        error: "Failed to process message",
        response: "I'm having trouble connecting to my movie database right now. Please try again in a moment.",
        movies: [],
        details: errorMessage
      },
      { status: 500 }
    );
  }
} 
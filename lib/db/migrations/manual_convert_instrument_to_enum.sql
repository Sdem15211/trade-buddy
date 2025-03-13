-- Ensure the enum type exists
DO $$ BEGIN
    CREATE TYPE instrument AS ENUM ('forex', 'crypto', 'stocks');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Convert the text column to enum with explicit casting
ALTER TABLE strategy 
ALTER COLUMN instrument TYPE instrument 
USING instrument::instrument; 
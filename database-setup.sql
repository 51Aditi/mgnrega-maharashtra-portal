-- MGNREGA Maharashtra Portal - Database Setup
-- PostgreSQL Schema and Sample Data

-- Create districts table
CREATE TABLE IF NOT EXISTS districts (
    district_id SERIAL PRIMARY KEY,
    district_name VARCHAR(100) NOT NULL UNIQUE,
    district_name_marathi VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create performance data table
CREATE TABLE IF NOT EXISTS mgnrega_performance (
    record_id SERIAL PRIMARY KEY,
    district_id INT REFERENCES districts(district_id),
    year INT NOT NULL,
    month INT NOT NULL,
    job_cards_issued INT DEFAULT 0,
    households_demanded_work INT DEFAULT 0,
    persons_worked INT DEFAULT 0,
    wage_payments DECIMAL(15, 2) DEFAULT 0,
    total_expenditure DECIMAL(15, 2) DEFAULT 0,
    total_days_worked INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(district_id, year, month)
);

-- Create indexes
CREATE INDEX idx_district_year_month ON mgnrega_performance(district_id, year, month);

-- Insert Maharashtra districts
INSERT INTO districts (district_name, district_name_marathi) VALUES
('Ahmednagar', 'अहमदनगर'),
('Akola', 'अकोला'),
('Amravati', 'अमरावती'),
('Aurangabad', 'औरंगाबाद'),
('Beed', 'बीड'),
('Bhandara', 'भंडारा'),
('Buldhana', 'बुलडाणा'),
('Chandrapur', 'चंद्रपूर'),
('Dhule', 'धुळे'),
('Gadchiroli', 'गडचिरोली'),
('Gondia', 'गोंदिया'),
('Hingoli', 'हिंगोली'),
('Jalgaon', 'जळगाव'),
('Jalna', 'जालना'),
('Kolhapur', 'कोल्हापूर'),
('Latur', 'लातूर'),
('Mumbai City', 'मुंबई शहर'),
('Mumbai Suburban', 'मुंबई उपनगर'),
('Nagpur', 'नागपूर'),
('Nanded', 'नांदेड'),
('Nandurbar', 'नंदुरबार'),
('Nashik', 'नाशिक'),
('Osmanabad', 'उस्मानाबाद'),
('Palghar', 'पालघर'),
('Parbhani', 'परभणी'),
('Pune', 'पुणे'),
('Raigad', 'रायगड'),
('Ratnagiri', 'रत्नागिरी'),
('Sangli', 'सांगली'),
('Satara', 'सातारा'),
('Sindhudurg', 'सिंधुदुर्ग'),
('Solapur', 'सोलापूर'),
('Thane', 'ठाणे'),
('Wardha', 'वर्धा'),
('Washim', 'वाशिम'),
('Yavatmal', 'यवतमाळ')
ON CONFLICT DO NOTHING;

-- Insert sample data for all districts (last 6 months)
DO $$
DECLARE
    dist_id INT;
    m INT;
    y INT;
BEGIN
    FOR dist_id IN SELECT district_id FROM districts LOOP
        FOR y IN 2024..2025 LOOP
            FOR m IN 1..12 LOOP
                IF (y = 2024 AND m >= 10) OR (y = 2025 AND m <= 3) THEN
                    INSERT INTO mgnrega_performance (
                        district_id, year, month,
                        job_cards_issued, households_demanded_work, persons_worked,
                        wage_payments, total_expenditure, total_days_worked
                    ) VALUES (
                        dist_id, y, m,
                        50000 + (random() * 150000)::INT,
                        30000 + (random() * 120000)::INT,
                        40000 + (random() * 140000)::INT,
                        50 + (random() * 250),
                        70 + (random() * 330),
                        10 + (random() * 70)
                    )
                    ON CONFLICT DO NOTHING;
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

// Định nghĩa các môn học và mã ID của chúng
const SUBJECTS = {
    NONE: 'none',
    TOAN: 'toan',
    VAN: 'van',
    NN: 'nn',
    LY: 'ly',
    HOA: 'hoa',
    SINH: 'sinh',
    SU: 'su',
    DIA: 'dia',
    GDCD: 'gdcd'
};

// Tên đầy đủ của các môn học
const SUBJECT_NAMES = {
    toan: 'Toán',
    van: 'Văn',
    nn: 'Anh',
    ly: 'Lý',
    hoa: 'Hóa',
    sinh: 'Sinh',
    su: 'Sử',
    dia: 'Địa',
    gdcd: 'GDCD'
};

// Thiết lập các event listener cho các input số
document.querySelectorAll('.form__input--number').forEach(input => {
    input.addEventListener('input', () => {
        normalizeInput(input);
        calculateResults();
    });
});

// Thiết lập các event listener cho các select box
document.querySelectorAll('.form__select').forEach(select => {
    select.addEventListener('change', () => {
        handleSelectChange(select);
        calculateResults();
    });
});

// Hàm chuẩn hóa giá trị input để đảm bảo nằm trong khoảng từ 0 đến 10
function normalizeInput(input) {
    let value = parseFloat(input.value);
    if (isNaN(value) || value < 0) {
        input.value = 0;
    } else if (value > 10) {
        input.value = 10;
    }
}

// Xử lý sự thay đổi trong các select box
function handleSelectChange(select) {
    let tuNhienRow = document.getElementById('tuNhienRow');
    let xaHoiRow = document.getElementById('xaHoiRow');

    // Hiển thị hoặc ẩn các dòng dựa trên lựa chọn của select "tohop"
    if (select.id === 'tohop') {
        if (select.value === 'tuNhien') {
            tuNhienRow.style.display = 'table-row';
            xaHoiRow.style.display = 'none';
        } else if (select.value === 'xaHoi') {
            tuNhienRow.style.display = 'none';
            xaHoiRow.style.display = 'table-row';
        } else {
            tuNhienRow.style.display = 'none';
            xaHoiRow.style.display = 'none';
        }
    }
}

// Tính toán kết quả dựa trên các giá trị hiện tại
function calculateResults() {
    let scores = getInputScores();
    let weightedSubject = document.getElementById('monHeSo2').value;
    let priorityArea = document.getElementById('khuVucUuTien').value;
    let priorityCategory = document.getElementById('doiTuongUuTien').value;

    // Nếu các giá trị nhập không hợp lệ, dừng tính toán
    if (!isInputValid(scores)) {
        return;
    }

    let combinations = calculateCombinations(scores, weightedSubject, priorityArea, priorityCategory);
    let results = generateResultsTable(combinations);

    displayResults(results);
}

// Lấy các điểm từ các input field
function getInputScores() {
    return {
        toan: parseFloat(document.getElementById(SUBJECTS.TOAN).value) || 0,
        van: parseFloat(document.getElementById(SUBJECTS.VAN).value) || 0,
        nn: parseFloat(document.getElementById(SUBJECTS.NN).value) || 0,
        ly: parseFloat(document.getElementById(SUBJECTS.LY).value) || 0,
        hoa: parseFloat(document.getElementById(SUBJECTS.HOA).value) || 0,
        sinh: parseFloat(document.getElementById(SUBJECTS.SINH).value) || 0,
        su: parseFloat(document.getElementById(SUBJECTS.SU).value) || 0,
        dia: parseFloat(document.getElementById(SUBJECTS.DIA).value) || 0,
        gdcd: parseFloat(document.getElementById(SUBJECTS.GDCD).value) || 0
    };
}

// Kiểm tra xem các điểm nhập vào có hợp lệ không (trong khoảng từ 0 đến 10)
function isInputValid(scores) {
    return Object.values(scores).every(score => score >= 0 && score <= 10);
}

// Tính toán các tổ hợp điểm dựa trên các lựa chọn đã chọn
function calculateCombinations(scores, weightedSubject, priorityArea, priorityCategory) {
    let combinations = [];
    let tohop = document.getElementById('tohop').value;

    // Tạo các tổ hợp điểm dựa trên lựa chọn "tohop"
    if (tohop === 'tuNhien') {
        combinations.push(
            { label: 'A00', subjects: [scores.toan, scores.ly, scores.hoa], names: ['Toán', 'Lý', 'Hóa'] },
            { label: 'A01', subjects: [scores.toan, scores.ly, scores.nn], names: ['Toán', 'Lý', 'Anh'] },
            { label: 'A02', subjects: [scores.toan, scores.ly, scores.sinh], names: ['Toán', 'Lý', 'Sinh'] },
            { label: 'B00', subjects: [scores.toan, scores.hoa, scores.sinh], names: ['Toán', 'Hóa', 'Sinh'] },
            { label: 'D07', subjects: [scores.toan, scores.hoa, scores.nn], names: ['Toán', 'Hóa', 'Anh'] },
            { label: 'D08', subjects: [scores.toan, scores.sinh, scores.nn], names: ['Toán', 'Sinh', 'Anh'] }
        );
    } else if (tohop === 'xaHoi') {
        combinations.push(
            { label: 'C00', subjects: [scores.van, scores.su, scores.dia], names: ['Văn', 'Sử', 'Địa'] },
            { label: 'C03', subjects: [scores.van, scores.toan, scores.su], names: ['Văn', 'Toán', 'Sử'] },
            { label: 'C04', subjects: [scores.van, scores.toan, scores.dia], names: ['Văn', 'Toán', 'Địa'] },
            { label: 'D01', subjects: [scores.van, scores.toan, scores.nn], names: ['Văn', 'Toán', 'Anh'] },
            { label: 'D14', subjects: [scores.van, scores.su, scores.nn], names: ['Văn', 'Sử', 'Anh'] },
            { label: 'D15', subjects: [scores.van, scores.dia, scores.nn], names: ['Văn', 'Địa', 'Anh'] }
        );
    }

    // Lọc ra các tổ hợp môn không hợp lệ
    combinations = combinations.filter(comb => comb.subjects.every(subject => !isNaN(subject)));

    return combinations.map(comb => {
        let total = comb.subjects.reduce((sum, score) => sum + score, 0);

        // Tính điểm cộng từ khu vực ưu tiên và đối tượng ưu tiên
        let priorityBonus = getPriorityBonus(priorityArea, priorityCategory);
        let cappedTotal = total;

        // Nếu tổng điểm vượt quá 30, giảm điểm cộng từ ưu tiên
        if (total + priorityBonus > 30) {
            let exceedAmount = total + priorityBonus - 30;
            priorityBonus -= exceedAmount;
        }

        // Tính lại tổng điểm
        cappedTotal = total + priorityBonus;

        return { ...comb, total: cappedTotal, priorityBonus };
    });
}

// Lấy điểm cộng từ khu vực ưu tiên và đối tượng ưu tiên
function getPriorityBonus(area, category) {
    const DOITUONG_UUTIEN_POINTS = {
        '1': 2,
        '2': 1,
        '3': 0.5
    };

    const KHUVUC_UUTIEN_POINTS = {
        'KV1': 0.75,
        'KV2NT': 0.5,
        'KV2': 0.25,
        'KV3': 0
    };

    let areaBonus = KHUVUC_UUTIEN_POINTS[area] || 0;
    let categoryBonus = DOITUONG_UUTIEN_POINTS[category] || 0;

    return areaBonus + categoryBonus;
}

// Tạo bảng kết quả để hiển thị
function generateResultsTable(combinations) {
    return combinations.map(comb => {
        let total = comb.total;
        let priorityBonus = comb.priorityBonus;

        // Nếu tổng điểm vượt quá 30, giảm điểm cộng từ ưu tiên
        if (total + priorityBonus > 30) {
            let exceedAmount = total + priorityBonus - 30;
            priorityBonus -= exceedAmount;
        }

        return {
            label: `${comb.label} (${comb.names.join(' + ')})`,
            total: total.toFixed(2),
            bonus: priorityBonus.toFixed(2)
        };
    });
}

// Hiển thị kết quả tính toán trên giao diện
function displayResults(results) {
    let table = document.getElementById('tableKetQua');
    table.innerHTML = '<tr><th>Tổ hợp</th><th>Điểm bài thi</th><th>Điểm cộng đối tượng ưu tiên</th><th>Điểm cộng khu vực ưu tiên</th><th>Tổng điểm thi</th></tr>';

    results.forEach(result => {
        let row = table.insertRow();
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        let cell4 = row.insertCell(3);
        let cell5 = row.insertCell(4);

        // Tính toán tổng điểm và điểm cộng từ ưu tiên
        let total = parseFloat(result.total);
        let bonus = parseFloat(result.bonus);
        let cappedTotal = total + bonus;

        // Hiển thị thông tin vào từng ô của bảng
        cell1.textContent = result.label;
        cell2.textContent = total.toFixed(2);
        cell3.textContent = bonus.toFixed(2);
        cell4.textContent = (bonus > 30 - total) ? `Không hợp lệ` : (bonus.toFixed(2));
        cell5.textContent = (bonus > 30 - total) ? `Không hợp lệ` : (cappedTotal.toFixed(2));
    });

    document.getElementById('ketqua').style.display = 'block';
}

// Reset các giá trị nhập
function resetForm() {
    document.querySelectorAll('.form__input--number').forEach(input => {
        input.value = '';
    });

    document.querySelectorAll('.form__select').forEach(select => {
        select.value = 'none';
    });

    document.getElementById('tuNhienRow').style.display = 'none';
    document.getElementById('xaHoiRow').style.display = 'none';

    document.getElementById('tableKetQua').innerHTML = '';

    document.getElementById('ketqua').style.display = 'none';
}

let version = '';

// 영어 태그를 한글로 변환하는 객체
const tagTranslations = {
    "Boots": "신발",
    "ManaRegen": "마나 재생",
    "HealthRegen": "체력 재생",
    "Health": "체력",
    "CriticalStrike": "치명타",
    "SpellDamage": "주문력",
    "Mana": "마나",
    "Armor": "방어력",
    "SpellBlock": "마법 저항력",
    "LifeSteal": "생명력 흡수",
    "SpellVamp": "주문 흡혈",
    "Jungle": "정글",
    "Damage": "데미지",
    "Lane": "라인",
    "AttackSpeed": "공격 속도",
    "OnHit": "적중 효과",
    "Trinket": "장신구",
    "Active": "사용 효과",
    "Consumable": "소모품",
    "CooldownReduction": "스킬 가속",
    "ArmorPenetration": "방어구 관통",
    "AbilityHaste": "스킬 가속",
    "Stealth": "은신",
    "Vision": "시야",
    "NonbootsMovement": "이동 속도 (신발 제외)",
    "Tenacity": "강인함",
    "MagicPenetration": "마법 관통",
    "Aura": "오라",
    "Slow": "둔화",
    "MagicResist": "마법 저항",
    "GoldPer": "골드 획득"
};

// Data Dragon에서 최신 버전 가져오기
async function getLatestVersion() {
    const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await response.json();
    return versions[0]; // 최신 버전
}

// 아이템 데이터 가져오기
async function getItemData(version) {
    const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/item.json`);
    const data = await response.json();
    return data.data;
}

// 카테고리 팝업 표시
function showCategoryPopup(categories) {
    const categoryPopup = document.getElementById('category-popup');
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';

    // 카테고리 목록 생성
    categories.forEach(category => {
        const translatedCategory = tagTranslations[category] || category;
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('category');
        categoryDiv.textContent = translatedCategory;
        categoryDiv.addEventListener('click', () => {
            displayItemsByCategory(category);
            categoryPopup.classList.add('hidden');
            categoryPopup.style.display = 'none';
        });
        categoryList.appendChild(categoryDiv);
    });

    // 카테고리 팝업 표시
    categoryPopup.classList.remove('hidden');
    categoryPopup.style.display = 'block';
}

// 아이템 카테고리에 따라 표시
function displayItemsByCategory(category) {
    const itemPopup = document.getElementById('item-popup');
    const itemsList = document.getElementById('items-list');
    itemsList.innerHTML = '';

    // 해당 카테고리의 아이템 목록 생성
    for (const id in items) {
        const item = items[id];
        if (item.inStore !== false && item.tags.includes(category)) {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item');
            itemDiv.dataset.id = id;

            const img = document.createElement('img');
            img.src = `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`;
            img.alt = item.name;

            itemDiv.appendChild(img);
            itemsList.appendChild(itemDiv);

            // 아이템 클릭 시 슬롯에 배치
            itemDiv.addEventListener('click', () => {
                selectItem(id, itemDiv);
                itemPopup.classList.add('hidden');
                itemPopup.style.display = 'none';
            });
        }
    }

    // 아이템 팝업 표시
    itemPopup.classList.remove('hidden');
    itemPopup.style.display = 'block';
}

// 슬롯 클릭 시 카테고리 팝업 열기
function handleSlotClick() {
    const categories = new Set();
    if (selectedSlot.classList.contains('ward-slot')) {
        categories.add('Trinket');
    } else {
        for (const id in items) {
            items[id].tags.forEach(tag => categories.add(tag));
        }
    }
    showCategoryPopup([...categories]);
}

// 슬롯에 아이템 선택
function selectItem(id, element) {
    const slotNumber = selectedSlot.dataset.slot;
    const slot = document.querySelector(`.slot[data-slot="${slotNumber}"]`);
    slot.innerHTML = '';

    const img = document.createElement('img');
    img.src = `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`;
    img.alt = element.querySelector('img').alt;
    slot.appendChild(img);
}

// 모든 슬롯 상태 캡처
function captureSlots() {
    const captureContainer = document.getElementById('capture-container');

    // 새로운 섹터 생성
    const captureSector = document.createElement('div');
    captureSector.classList.add('capture-sector');
    const captureGrid = document.createElement('div');
    captureGrid.classList.add('capture-grid');

    // 각 슬롯의 상태를 캡처하여 새로운 섹터에 추가
    document.querySelectorAll('.slot').forEach(slot => {
        const capturedSlot = document.createElement('div');
        capturedSlot.classList.add('captured-slot');

        if (slot.firstChild) {
            const img = document.createElement('img');
            img.src = slot.firstChild.src;
            img.alt = slot.firstChild.alt;
            capturedSlot.appendChild(img);
        }

        captureGrid.appendChild(capturedSlot);
    });

    captureSector.appendChild(captureGrid);

    // 새로운 줄이 필요한지 확인
    if (captureContainer.lastElementChild) {
        const lastRow = captureContainer.lastElementChild;
        lastRow.appendChild(captureSector);

        // 줄을 넘길 필요가 있는지 계산
        const containerRect = captureContainer.getBoundingClientRect();
        const sectorRect = captureSector.getBoundingClientRect();
        const lastRowRect = lastRow.getBoundingClientRect();

        if (sectorRect.right > containerRect.right) {
            lastRow.removeChild(captureSector);

            const newRow = document.createElement('div');
            newRow.classList.add('capture-row');
            newRow.appendChild(captureSector);
            captureContainer.appendChild(newRow);
        } else {
            // 기존 줄에 추가할 수 있으면 화살표 추가
            if (lastRow.children.length > 1) {
                const arrow = document.createElement('div');
                arrow.classList.add('arrow');
                arrow.textContent = '→';
                lastRow.insertBefore(arrow, captureSector);
            }
        }
    } else {
        // 첫 섹터인 경우, 새로운 줄을 추가
        const newRow = document.createElement('div');
        newRow.classList.add('capture-row');
        newRow.appendChild(captureSector);
        captureContainer.appendChild(newRow);
    }
}

// 마지막 섹터 취소
function cancelLastSector() {
    const captureContainer = document.getElementById('capture-container');
    const lastRow = captureContainer.lastElementChild;

    if (lastRow && lastRow.lastElementChild) {
        const lastSector = lastRow.lastElementChild;

        // 화살표 제거
        if (lastSector.previousElementSibling && lastSector.previousElementSibling.classList.contains('arrow')) {
            lastSector.previousElementSibling.remove();
        }

        // 섹터 제거
        lastSector.remove();

        // 행이 비었으면 행 제거
        if (lastRow.children.length === 0) {
            lastRow.remove();
        }
    }
}

// 슬롯 초기화
function clearSlots() {
    document.querySelectorAll('.slot').forEach(slot => {
        slot.innerHTML = '';
    });
}

// 팝업 닫기 버튼 이벤트 처리
document.getElementById('close-popup').addEventListener('click', () => {
    const categoryPopup = document.getElementById('category-popup');
    categoryPopup.classList.add('hidden');
    categoryPopup.style.display = 'none';
});

document.getElementById('close-item-popup').addEventListener('click', () => {
    const itemPopup = document.getElementById('item-popup');
    itemPopup.classList.add('hidden');
    itemPopup.style.display = 'none';
});

// 이벤트 리스너 추가
document.getElementById('select-button').addEventListener('click', captureSlots);
document.getElementById('cancel-last-button').addEventListener('click', cancelLastSector);
document.getElementById('clear-button').addEventListener('click', clearSlots);

// 슬롯 클릭 이벤트 추가
let selectedSlot = null;
document.querySelectorAll('.slot').forEach(slot => {
    slot.addEventListener('click', (event) => {
        event.stopPropagation();
        selectedSlot = slot;
        handleSlotClick();
    });
});

// 데이터 가져오기 및 초기화
let items = {};

(async () => {
    try {
        version = await getLatestVersion(); // 최신 버전 가져오기
        items = await getItemData(version); // 최신 버전의 아이템 데이터 가져오기
    } catch (error) {
        console.error('데이터를 불러오는 중 오류 발생:', error);
    }
})();

// 섹터를 PNG 또는 JPG 이미지로 내보내기
// 섹터 전체를 PNG 이미지로 내보내기
function exportAllSectorsAsImage(format = 'png') {
    const captureContainer = document.getElementById('capture-container');

    if (captureContainer && captureContainer.children.length > 0) {
        // capture-container 전체를 캡처
        html2canvas(captureContainer, {
            backgroundColor: null,
            useCORS: true, // CORS 문제 해결을 위해 추가
            allowTaint: true // 타사 도메인에서 로드된 이미지 처리
        }).then(canvas => {
            const link = document.createElement('a');
            if (format === 'png') {
                link.href = canvas.toDataURL('image/png');
                link.download = 'all_sectors.png';
            } else if (format === 'jpg' || format === 'jpeg') {
                link.href = canvas.toDataURL('image/jpeg', 0.9); // JPG 형식 및 품질 설정
                link.download = 'all_sectors.jpg';
            }
            link.click();
        }).catch(error => {
            console.error('모든 섹터 이미지를 내보내는 중 오류 발생:', error);
        });
    } else {
        console.warn('내보낼 섹터가 없습니다.');
    }
}

// PNG 내보내기 버튼 추가
document.getElementById('export-png-button').addEventListener('click', () => {
    exportAllSectorsAsImage('png');
});

// JPG 내보내기 버튼 추가
document.getElementById('export-jpg-button').addEventListener('click', () => {
    exportAllSectorsAsImage('jpg');
});


// 모든 슬롯을 PNG 또는 JPG 이미지로 내보내기
function exportAllSlotsAsImage(format = 'png') {
    const allSlotsContainer = document.getElementById('item-container'); // 모든 슬롯이 있는 컨테이너 선택

    if (allSlotsContainer) {
        html2canvas(allSlotsContainer, {
            backgroundColor: null,
            useCORS: true, // CORS 문제 해결
            allowTaint: true // 타사 도메인에서 로드된 이미지 처리
        }).then(canvas => {
            const link = document.createElement('a');
            if (format === 'png') {
                link.href = canvas.toDataURL('image/png');
                link.download = 'all_slots.png';
            } else if (format === 'jpg' || format === 'jpeg') {
                link.href = canvas.toDataURL('image/jpeg', 0.9); // JPG 형식 및 품질 설정
                link.download = 'all_slots.jpg';
            }
            link.click();
        }).catch(error => {
            console.error('슬롯 이미지를 내보내는 중 오류 발생:', error);
        });
    } else {
        console.warn('내보낼 슬롯이 없습니다.');
    }
}

// 모든 슬롯 PNG 내보내기 버튼 추가
document.getElementById('export-all-slots-png-button').addEventListener('click', () => {
    exportAllSlotsAsImage('png');
});

// 모든 슬롯 JPG 내보내기 버튼 추가
document.getElementById('export-all-slots-jpg-button').addEventListener('click', () => {
    exportAllSlotsAsImage('jpg');
});

